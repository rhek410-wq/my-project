// 세계 날씨 앱: 상태 관리, 이벤트, 화면 그리기
const ICON_URL = 'https://openweathermap.org/img/wn/';
const CARD_COUNT = 6;       // 카드로 바로 날씨를 불러오는 도시 수 (나머지는 "다른 도시" 목록)
const DIRECTIONS = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동',
    '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];

let apiKey = '';            // config.js의 API 키 (안 넣었으면 '')
let continentId = 'asia';   // 선택된 대륙
let countryCode = 'KR';     // 선택된 나라
let cityIndex = 0;          // 선택된 도시 카드 인덱스 (목록에 없는 검색 도시면 -1)
let selectedCity = null;    // 상세 패널 도시: { name, lat, lon, code }
let cityWeather = [];       // 도시 카드 데이터: { status: 'idle'|'loading'|'ok'|'error', data, error }
let detail = null;          // 상세 패널: { status: 'nokey'|'loading'|'ok'|'error', current, forecast, error }
let searchResults = [];     // 도시 검색 결과: { name, sub, lat, lon, code }
let countryRequestId = 0;   // 늦게 온 이전 나라 응답 무시용
let detailRequestId = 0;    // 늦게 온 이전 도시 응답 무시용
let searchRequestId = 0;    // 늦게 온 이전 검색 응답 무시용

const els = {
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    continentTabs: document.getElementById('continentTabs'),
    countrySelect: document.getElementById('countrySelect'),
    cityGrid: document.getElementById('cityGrid'),
    moreCities: document.getElementById('moreCities'),
    detailPanel: document.getElementById('detailPanel')
};

// 국가 코드 → { continent, country } (검색 결과를 대륙·나라에 연결할 때 사용)
const COUNTRY_INDEX = {};
CONTINENTS.forEach((continent) => {
    continent.countries.forEach((c) => {
        COUNTRY_INDEX[c.code] = { continent, country: c };
    });
});

// ---------- 데이터 조회 ----------

function getContinent() {
    return CONTINENTS.find((c) => c.id === continentId);
}

function getCountry() {
    return COUNTRY_INDEX[countryCode].country;
}

function getCountryName(code) {
    return COUNTRY_INDEX[code]?.country.name || code;
}

function isMobile() {
    return window.matchMedia('(max-width: 991.98px)').matches;
}

// ---------- 초기화 ----------

function init() {
    // 키를 안 넣었거나 예시 값 그대로면 키 없음으로 본다
    const key = typeof API_KEY === 'string' ? API_KEY.trim() : '';
    apiKey = key === 'YOUR_API_KEY' ? '' : key;

    els.continentTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-id]');
        if (btn) selectContinent(btn.dataset.id);
    });

    els.countrySelect.addEventListener('change', () => selectCountry(els.countrySelect.value));

    els.cityGrid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-index]');
        if (!card) return;
        const index = Number(card.dataset.index);
        // 실패한 카드를 누르면 그 카드도 다시 불러온다
        if (cityWeather[index]?.status === 'error') loadCityCard(index);
        selectCity(index, true);
    });

    els.moreCities.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-index]');
        if (btn) selectCity(Number(btn.dataset.index), true);
    });

    els.detailPanel.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="refresh"]')) loadDetail(true);
    });

    // 도시 검색: 입력하면 목록 안 도시를 바로 보여주고, 검색 버튼(Enter)을 누르면 전 세계에서 찾는다
    els.searchInput.addEventListener('input', () => showLocalResults());
    els.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchWorld();
    });
    els.searchResults.addEventListener('click', (e) => {
        const item = e.target.closest('[data-result]');
        if (item) selectSearchResult(searchResults[Number(item.dataset.result)]);
    });
    document.addEventListener('click', (e) => {
        if (!els.searchForm.contains(e.target)) hideSearchResults();
    });
    els.searchForm.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideSearchResults();
    });

    // 지도의 도시 점을 누르면 그 도시 선택
    initMap('weatherMap', apiKey, (index) => selectCity(index, false));

    selectCountry(countryCode);
}

// ---------- 대륙 · 나라 · 도시 선택 ----------

function selectContinent(id) {
    continentId = id;
    selectCountry(getContinent().defaultCountry);
}

function selectCountry(code) {
    countryCode = code;
    renderContinents();
    renderCountries();
    loadCountryWeather();
    selectCity(0, false);
}

function selectCity(index, byUser) {
    cityIndex = index;
    selectedCity = { ...getCountry().cities[index], code: countryCode };
    renderCities();
    updateMap(selectedCity, getCountry().cities, cityIndex);
    loadDetail();
    if (byUser) scrollToDetail();
}

// 모바일에서는 카드 위에 있는 상세 패널로 스크롤
function scrollToDetail() {
    if (isMobile()) els.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- 도시 검색 ----------

// 목록(cities.js)에 있는 도시 중 이름이 맞는 것
function findLocalCities(query) {
    const q = query.toLowerCase();
    const found = [];
    CONTINENTS.forEach((continent) => {
        continent.countries.forEach((c) => {
            c.cities.forEach((city) => {
                if (city.name.toLowerCase().includes(q) || c.name === query) {
                    found.push({ name: city.name, sub: `${c.flag} ${c.name}`, lat: city.lat, lon: city.lon, code: c.code });
                }
            });
        });
    });
    return found.slice(0, 6);
}

function showLocalResults() {
    const query = els.searchInput.value.trim();
    searchRequestId++;
    if (!query) {
        hideSearchResults();
        return;
    }
    searchResults = findLocalCities(query);
    renderSearchResults(searchResults.length ? '' : 'Enter를 누르면 전 세계에서 찾아요.');
}

// 목록 + OpenWeather Geocoding API로 전 세계 도시 검색
async function searchWorld() {
    const query = els.searchInput.value.trim();
    if (!query) return;

    const id = ++searchRequestId;
    const local = findLocalCities(query);
    searchResults = local;

    if (!apiKey) {
        renderSearchResults('API 키를 넣어야 목록에 없는 도시도 찾을 수 있어요.');
        return;
    }
    renderSearchResults('전 세계에서 찾는 중…');

    try {
        const found = await searchCities(query, apiKey);
        if (id !== searchRequestId) return;
        // 목록에 이미 있는 도시(거의 같은 좌표)는 빼고 합친다
        const extra = found
            .filter((r) => !local.some((l) => Math.abs(l.lat - r.lat) < 0.1 && Math.abs(l.lon - r.lon) < 0.1))
            .map((r) => {
                const info = COUNTRY_INDEX[r.country];
                const countryLabel = info ? `${info.country.flag} ${info.country.name}` : r.country;
                return {
                    name: r.local_names?.ko || r.name,
                    sub: [r.state, countryLabel].filter(Boolean).join(', '),
                    lat: r.lat,
                    lon: r.lon,
                    code: r.country
                };
            });
        searchResults = [...local, ...extra];
        renderSearchResults(searchResults.length ? '' : `"${query}"에 맞는 도시를 찾지 못했어요. 영어 이름으로도 검색해 보세요.`);
    } catch (err) {
        if (id !== searchRequestId) return;
        renderSearchResults(err.message);
    }
}

function selectSearchResult(result) {
    hideSearchResults();
    els.searchInput.value = '';

    // 검색한 도시의 나라가 목록에 있으면 그 대륙·나라로 이동해서 카드도 보여준다
    const info = COUNTRY_INDEX[result.code];
    if (info && result.code !== countryCode) {
        continentId = info.continent.id;
        countryCode = result.code;
        renderContinents();
        renderCountries();
        loadCountryWeather();
    }

    // 목록에 있는 도시면 그 카드를 선택, 없으면 -1
    cityIndex = info && result.code === countryCode
        ? getCountry().cities.findIndex((c) => Math.abs(c.lat - result.lat) < 0.1 && Math.abs(c.lon - result.lon) < 0.1)
        : -1;
    selectedCity = { name: result.name, lat: result.lat, lon: result.lon, code: result.code };
    renderCities();
    // 목록에 없는 나라면 지도에는 검색한 도시만 표시
    updateMap(selectedCity, info ? getCountry().cities : [], cityIndex);
    loadDetail();
    scrollToDetail();
}

function hideSearchResults() {
    els.searchResults.hidden = true;
}

// ---------- 날씨 불러오기 ----------

// 카드 도시(앞의 6개)의 현재 날씨를 동시에 불러온다
async function loadCountryWeather() {
    const cards = getCountry().cities.slice(0, CARD_COUNT);
    const id = ++countryRequestId;

    if (!apiKey) {
        cityWeather = cards.map(() => ({ status: 'idle' }));
        renderCities();
        return;
    }

    cityWeather = cards.map(() => ({ status: 'loading' }));
    renderCities();

    await Promise.all(cards.map(async (city, i) => {
        try {
            const data = await fetchCurrent(city.lat, city.lon, apiKey);
            if (id !== countryRequestId) return;
            cityWeather[i] = { status: 'ok', data };
        } catch (err) {
            if (id !== countryRequestId) return;
            cityWeather[i] = { status: 'error', error: err.message };
        }
        renderCities();
    }));
}

// 카드 하나만 다시 불러오기
async function loadCityCard(index) {
    const city = getCountry().cities[index];
    const id = countryRequestId;
    cityWeather[index] = { status: 'loading' };
    renderCities();
    try {
        const data = await fetchCurrent(city.lat, city.lon, apiKey, true);
        if (id !== countryRequestId) return;
        cityWeather[index] = { status: 'ok', data };
    } catch (err) {
        if (id !== countryRequestId) return;
        cityWeather[index] = { status: 'error', error: err.message };
    }
    renderCities();
}

// 상세 패널: 현재 날씨 + 예보 (예보는 실패해도 괜찮다)
async function loadDetail(force = false) {
    const city = selectedCity;
    const index = cityIndex;
    const id = ++detailRequestId;

    if (!apiKey) {
        detail = { status: 'nokey' };
        renderDetail();
        return;
    }

    detail = { status: 'loading' };
    renderDetail();

    try {
        const [current, forecast] = await Promise.all([
            fetchCurrent(city.lat, city.lon, apiKey, force),
            fetchForecast(city.lat, city.lon, apiKey, force).catch(() => null)
        ]);
        if (id !== detailRequestId) return;
        detail = { status: 'ok', current, forecast };
        // 새로고침한 값을 카드에도 반영
        if (index >= 0 && index < CARD_COUNT) {
            cityWeather[index] = { status: 'ok', data: current };
            renderCities();
        }
    } catch (err) {
        if (id !== detailRequestId) return;
        detail = { status: 'error', error: err.message };
    }
    renderDetail();
}

// ---------- 계산 ----------

// 유닉스 초 + 시간대 오프셋 → 현지 날짜 'YYYY-MM-DD'
function toLocalDate(sec, timezone) {
    return new Date((sec + timezone) * 1000).toISOString().slice(0, 10);
}

// 현지 시각 'HH:mm'
function formatLocalTime(dt, timezone) {
    return new Date((dt + timezone) * 1000).toISOString().slice(11, 16);
}

// 오늘 최고/최저: 예보 중 현지 오늘 항목 + 현재 온도
function getTodayMinMax(current, forecast) {
    const today = toLocalDate(Date.now() / 1000, current.timezone);
    const items = forecast
        ? forecast.list.filter((item) => toLocalDate(item.dt, forecast.city.timezone) === today)
        : [];

    if (items.length === 0) {
        return { max: current.main.temp_max, min: current.main.temp_min, fallback: true };
    }
    return {
        max: Math.max(current.main.temp, ...items.map((item) => item.main.temp_max)),
        min: Math.min(current.main.temp, ...items.map((item) => item.main.temp_min)),
        fallback: false
    };
}

// 16방위 한글
function getWindDirection(deg) {
    return DIRECTIONS[Math.round(deg / 22.5) % 16];
}

// ---------- 화면 그리기 ----------

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderSearchResults(message) {
    const items = searchResults.map((r, i) => `
        <button type="button" class="list-group-item list-group-item-action" data-result="${i}">
            <div class="fw-semibold">${escapeHtml(r.name)}</div>
            <small class="text-body-secondary">${escapeHtml(r.sub)}</small>
        </button>
    `).join('');
    const note = message
        ? `<div class="list-group-item small text-body-secondary">${escapeHtml(message)}</div>`
        : '';
    els.searchResults.innerHTML = items + note;
    els.searchResults.hidden = false;
}

function renderContinents() {
    els.continentTabs.innerHTML = CONTINENTS.map((c) => `
        <li class="nav-item">
            <button type="button" class="nav-link ${c.id === continentId ? 'active' : ''}"
                data-id="${c.id}" ${c.id === continentId ? 'aria-current="page"' : ''}>${c.name}</button>
        </li>
    `).join('');
}

// 나라 선택 목록 (가나다순)
function renderCountries() {
    const countries = getContinent().countries;
    els.countrySelect.innerHTML = countries.map((c) => `
        <option value="${c.code}">${c.flag} ${c.name}</option>
    `).join('');
    els.countrySelect.value = countryCode;
    els.countrySelect.title = `${countries.length}개 나라`;
}

function renderCities() {
    const cities = getCountry().cities;
    els.cityGrid.innerHTML = cities.slice(0, CARD_COUNT).map((city, i) => {
        const state = cityWeather[i] || { status: 'idle' };
        const selected = i === cityIndex;
        return `
            <div class="col">
                <button type="button" class="card city-card h-100 w-100 text-start ${selected ? 'selected' : ''}"
                    data-index="${i}" aria-pressed="${selected}">
                    <div class="card-body w-100">
                        <div class="fw-semibold mb-1">${city.name}</div>
                        ${cityCardBody(state)}
                    </div>
                </button>
            </div>
        `;
    }).join('');
    renderMoreCities();
}

// 다른 도시: 카드 밖의 도시를 작은 버튼으로 (누르면 상세에서 날씨를 불러온다)
function renderMoreCities() {
    const rest = getCountry().cities.slice(CARD_COUNT);
    if (rest.length === 0) {
        els.moreCities.innerHTML = '';
        return;
    }
    els.moreCities.innerHTML = `
        <h2 class="h6 text-body-secondary mb-2">다른 도시 <span class="fw-normal">${rest.length}</span></h2>
        <div class="d-flex flex-wrap gap-2">
            ${rest.map((city, i) => {
                const index = CARD_COUNT + i;
                const selected = index === cityIndex;
                return `<button type="button" class="btn btn-sm rounded-pill ${selected ? 'btn-primary' : 'btn-outline-secondary'}"
                    data-index="${index}" aria-pressed="${selected}">${city.name}</button>`;
            }).join('')}
        </div>`;
}

function cityCardBody(state) {
    if (state.status === 'loading') {
        return `
            <p class="placeholder-glow mb-0">
                <span class="placeholder col-7 placeholder-lg"></span>
                <span class="placeholder col-5"></span>
            </p>`;
    }
    if (state.status === 'error') {
        return `<div class="small text-danger"><i class="bi bi-arrow-clockwise me-1"></i>불러오지 못했어요<br><span class="text-body-secondary">눌러서 다시 시도</span></div>`;
    }
    if (state.status === 'ok') {
        const w = state.data.weather[0];
        return `
            <div class="d-flex align-items-center">
                <img class="weather-icon" src="${ICON_URL}${w.icon}@2x.png" alt="">
                <span class="city-temp">${Math.round(state.data.main.temp)}°</span>
            </div>
            <div class="small text-body-secondary text-truncate">${escapeHtml(w.description)}</div>`;
    }
    return '<div class="small text-body-secondary">API 키 필요</div>';
}

function renderDetail() {
    const panel = els.detailPanel;

    if (!detail || detail.status === 'nokey') {
        panel.innerHTML = `
            <div class="alert alert-info mb-0">
                <i class="bi bi-info-circle me-1"></i>
                <code>js/config.js</code>의 <code>API_KEY</code>에 OpenWeather API 키를 넣어주세요.
                키는 <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener" class="alert-link">여기</a>에서 무료로 발급받을 수 있어요.
            </div>`;
        return;
    }

    if (detail.status === 'loading') {
        panel.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body text-center py-5">
                    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">불러오는 중</span></div>
                </div>
            </div>`;
        return;
    }

    if (detail.status === 'error') {
        panel.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-1"></i>${escapeHtml(detail.error)}
            </div>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-action="refresh">
                <i class="bi bi-arrow-clockwise me-1"></i>다시 시도
            </button>`;
        return;
    }

    const { current, forecast } = detail;
    const w = current.weather[0];
    const range = getTodayMinMax(current, forecast);
    const deg = current.wind.deg;
    const hasDeg = typeof deg === 'number';
    const searched = cityIndex < 0;

    panel.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-baseline gap-2">
                    <h2 class="h5 mb-0">${escapeHtml(selectedCity.name)}, ${escapeHtml(getCountryName(selectedCity.code))}</h2>
                    <small class="text-body-secondary text-nowrap">현지 ${formatLocalTime(current.dt, current.timezone)} 기준</small>
                </div>
                ${searched ? '<span class="badge text-bg-light border mt-1"><i class="bi bi-search me-1"></i>검색한 도시</span>' : ''}

                <div class="d-flex align-items-center gap-3 my-3">
                    <img class="weather-icon-lg" src="${ICON_URL}${w.icon}@2x.png" alt="${escapeHtml(w.description)}">
                    <div>
                        <div class="detail-temp">${Math.round(current.main.temp)}°C</div>
                        <div class="text-body-secondary mt-1">
                            ${escapeHtml(w.description)} · 체감 ${Math.round(current.main.feels_like)}°C
                        </div>
                    </div>
                </div>

                <div class="row g-2">
                    <div class="col-6">
                        <div class="metric">
                            <div class="metric-label"><i class="bi bi-thermometer-half me-1"></i>최고 / 최저</div>
                            <div class="metric-value">
                                <span class="text-danger">${Math.round(range.max)}°</span> /
                                <span class="text-primary">${Math.round(range.min)}°</span>
                            </div>
                            ${range.fallback ? '<div class="small text-body-secondary">(현재 관측 범위)</div>' : ''}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="metric">
                            <div class="metric-label"><i class="bi bi-droplet me-1"></i>습도</div>
                            <div class="metric-value">${current.main.humidity}%</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="metric">
                            <div class="metric-label"><i class="bi bi-wind me-1"></i>풍속</div>
                            <div class="metric-value">${current.wind.speed.toFixed(1)} m/s</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="metric">
                            <div class="metric-label"><i class="bi bi-compass me-1"></i>풍향</div>
                            <div class="metric-value">
                                ${hasDeg
                                    ? `<i class="bi bi-arrow-up wind-arrow"></i> ${getWindDirection(deg)}풍 <span class="small fw-normal text-body-secondary">(${deg}°)</span>`
                                    : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn btn-outline-secondary btn-sm mt-3" data-action="refresh">
                    <i class="bi bi-arrow-clockwise me-1"></i>새로고침
                </button>
            </div>
        </div>`;

    // 화살표는 바람이 불어가는 방향(불어오는 방향 + 180°)을 가리킨다
    const arrow = panel.querySelector('.wind-arrow');
    if (arrow) arrow.style.transform = `rotate(${deg + 180}deg)`;

    setMapWeather(`${selectedCity.name} ${Math.round(current.main.temp)}°C`);
}

init();
