// 지도 (Leaflet + OpenStreetMap): 선택한 도시 위치와 같은 나라 도시 표시
const OWM_TILE_URL = 'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={key}';

let weatherMap = null;
let cityLayer = null;        // 같은 나라 도시 점들
let selectedMarker = null;   // 선택한 도시 핀
let onMapCityClick = null;   // 점을 눌렀을 때 호출할 함수 (app.js에서 넘겨줌)

function initMap(elementId, key, onCityClick) {
    // Leaflet을 못 불러왔으면 지도 없이 동작
    if (!window.L) {
        document.getElementById(elementId).innerHTML =
            '<div class="small text-body-secondary p-3">지도를 불러오지 못했어요.</div>';
        return;
    }
    onMapCityClick = onCityClick;

    weatherMap = L.map(elementId, { worldCopyJump: true }).setView([20, 0], 2);

    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(weatherMap);

    // OpenWeather 날씨 레이어 (키가 있을 때만)
    if (key) {
        const owmLayer = (layer) => L.tileLayer(OWM_TILE_URL, {
            layer, key, opacity: 0.6, attribution: '&copy; OpenWeather'
        });
        L.control.layers(
            { '기본 지도': baseLayer },
            { '기온': owmLayer('temp_new'), '구름': owmLayer('clouds_new'), '강수': owmLayer('precipitation_new') },
            { collapsed: true }
        ).addTo(weatherMap);
    }

    cityLayer = L.layerGroup().addTo(weatherMap);
}

// 지도 갱신: city = 선택한 도시, countryCities = 같은 나라 도시 목록, selectedIndex = 목록 속 위치(없으면 -1)
function updateMap(city, countryCities, selectedIndex) {
    if (!weatherMap) return;

    cityLayer.clearLayers();
    countryCities.forEach((c, i) => {
        if (i === selectedIndex) return;
        L.circleMarker([c.lat, c.lon], {
            radius: 6, color: '#0d6efd', weight: 2, fillColor: '#fff', fillOpacity: 1
        })
            .bindTooltip(c.name, { direction: 'top' })
            .on('click', () => onMapCityClick && onMapCityClick(i))
            .addTo(cityLayer);
    });

    if (selectedMarker) selectedMarker.remove();
    selectedMarker = L.marker([city.lat, city.lon], { title: city.name }).addTo(weatherMap);
    selectedMarker.bindTooltip(city.name, { permanent: true, direction: 'top', offset: [-16, -14] });

    // 선택한 도시를 가운데 두고, 같은 나라 도시도 화면에 들어오게 한 단계 더 넓게 본다
    const points = countryCities.map((c) => [c.lat, c.lon]).concat([[city.lat, city.lon]]);
    const bounds = L.latLngBounds(points);
    const fitZoom = weatherMap.getBoundsZoom(bounds.pad(0.2)) - 1;
    weatherMap.setView([city.lat, city.lon], Math.max(3, Math.min(fitZoom, 9)));
}

// 선택한 도시 핀에 날씨 표시 (예: "서울 14°C")
function setMapWeather(text) {
    if (selectedMarker) selectedMarker.setTooltipContent(text);
}
