// OpenWeather API 호출 + 10분 캐시
const API_BASE = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL = 10 * 60 * 1000;

// 키: '종류:lat,lon', 값: { time, promise } (같은 요청이 동시에 나가지 않도록 promise를 저장)
const weatherCache = new Map();

// fetch 공통 처리: HTTP 상태를 사용자용 메시지로 바꿔서 throw
async function request(url) {
    let res;
    try {
        res = await fetch(url);
    } catch (e) {
        throw new Error('인터넷 연결을 확인해 주세요.');
    }

    if (res.status === 401) {
        throw new Error('API 키가 올바르지 않거나 아직 활성화되지 않았어요. 새로 발급한 키는 활성화까지 최대 2시간이 걸려요.');
    }
    if (res.status === 429) {
        throw new Error('요청이 너무 많아요. 1분 뒤에 다시 시도해 주세요.');
    }
    if (!res.ok) {
        throw new Error(`날씨를 불러오지 못했어요. (코드 ${res.status})`);
    }
    return res.json();
}

function fetchWithCache(type, lat, lon, key, force) {
    const cacheKey = `${type}:${lat},${lon}`;
    const hit = weatherCache.get(cacheKey);
    if (!force && hit && Date.now() - hit.time < CACHE_TTL) {
        return hit.promise;
    }

    const params = new URLSearchParams({ lat, lon, units: 'metric', lang: 'kr', appid: key });
    const promise = request(`${API_BASE}/${type}?${params}`).catch((err) => {
        // 실패한 요청은 캐시에 남기지 않는다
        if (weatherCache.get(cacheKey)?.promise === promise) {
            weatherCache.delete(cacheKey);
        }
        throw err;
    });
    weatherCache.set(cacheKey, { time: Date.now(), promise });
    return promise;
}

// 현재 날씨
function fetchCurrent(lat, lon, key, force = false) {
    return fetchWithCache('weather', lat, lon, key, force);
}

// 5일 / 3시간 예보
function fetchForecast(lat, lon, key, force = false) {
    return fetchWithCache('forecast', lat, lon, key, force);
}

// 도시 이름으로 좌표 찾기 (Geocoding API, 최대 5개)
function searchCities(query, key) {
    const params = new URLSearchParams({ q: query, limit: 5, appid: key });
    return request(`https://api.openweathermap.org/geo/1.0/direct?${params}`);
}
