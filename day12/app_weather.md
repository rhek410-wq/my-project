# PRD: 세계 날씨 (app_weather)

| 항목 | 내용 |
|---|---|
| 문서 버전 | **v1.5** |
| 상태 | 구현 완료 |
| 작성일 | 2026-10-05 |
| 최종 수정일 | 2026-10-06 |
| 구현 위치 | `day12/app_weather/` |

## 1. 개요

OpenWeather API로 전 세계(6대륙 206개 나라·지역, 1,015개 도시)의 현재 날씨를 보여주는 웹 앱이다.
대륙 → 나라 → 도시 순서로 고르면 그 도시의 현재 온도, 최고/최저 기온, 풍속, 풍향, 습도를 볼 수 있고, 지도에서 위치를 확인할 수 있다.
목록에 없는 도시는 상단 검색으로 전 세계에서 찾는다.

- 대상: 여러 나라 도시의 날씨를 한눈에 보고 싶은 일반 사용자
- 실행 방식: 브라우저에서 `index.html`을 열면 바로 동작해야 한다 (빌드·서버 없음)
- API 키: 개발자가 `js/config.js`의 `API_KEY` 상수에 직접 넣는다. (git에 올리면 키가 공개되니 주의)

## 2. 기술 스택

| 항목 | 내용 |
|---|---|
| 마크업 | HTML5 |
| 스타일 | Bootstrap 5.3 (CDN) + 직접 작성한 CSS |
| 스크립트 | 순수 JavaScript (ES6, `fetch`, `async/await`, 프레임워크·빌드 도구 없음) |
| 아이콘 | Bootstrap Icons (CDN), 날씨 아이콘은 OpenWeather 제공 이미지 |
| 지도 | Leaflet 1.9.4 (cdnjs) + OpenStreetMap 타일, OpenWeather 날씨 타일 레이어 |
| 데이터 | OpenWeather Current Weather, 5 Day / 3 Hour Forecast, Geocoding API (무료 플랜) |

CDN 링크:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
```

## 3. 파일 구조

HTML, CSS, JS를 분리한다.

```
day12/app_weather/
├── index.html        # 화면 구조 (Bootstrap 컴포넌트)
├── css/
│   └── style.css     # 검색칸, 도시 카드 선택 표시, 풍향 화살표, 지도 크기 등 Bootstrap에 없는 스타일
└── js/
    ├── config.js     # API 키 상수
    ├── cities.js     # 대륙·나라·도시 데이터 (좌표 포함)
    ├── api.js        # OpenWeather 호출, 캐시, 에러 처리
    ├── map.js        # Leaflet 지도 (위치 핀, 같은 나라 도시 점, 날씨 레이어)
    └── app.js        # 상태 관리, 이벤트, 화면 그리기
```

- `index.html`에서 스크립트는 `</body>` 바로 앞에 `config.js` → `cities.js` → Leaflet → `api.js` → `map.js` → `app.js` 순서로 불러온다.
- 인라인 `style`, 인라인 `onclick`은 쓰지 않는다. 스타일은 `style.css`, 이벤트는 `app.js`의 `addEventListener`로 처리한다.
- 코드 주석은 한국어로 짧게 단다.

## 4. 화면 구성

PC(`lg` 이상)는 도시 카드와 상세 패널이 2단이고, 모바일은 상세 패널이 위, 도시 카드가 아래로 쌓인다.

```
┌──────────────────────────────────────────────────┐
│ ① ☁ World Weather                 (🔍 도시 검색    ) │
├──────────────────────────────────────────────────┤
│ ② (아시아) 유럽 북아메리카 남아메리카 아프리카 오세아니아  ③ [🇰🇷 대한민국 ▼] │
├────────────────────────────┬─────────────────────┤
│ ④ 도시 카드 (앞 6개)         │ ⑤ 상세 날씨          │
│ ┌─────────┐ ┌─────────┐    │ 서울, 대한민국 현지 21:50│
│ │서울 ☀ 18°│ │부산 ☁ 21°│ …  │ ☀ 18°C  맑음·체감 17°C │
│ └─────────┘ └─────────┘    │ ┌────────┬────────┐ │
│ ┌─────────┐ ┌─────────┐    │ │최고/최저│ 습도    │ │
│ │인천 🌧 16°│ │대구 ☀ 22°│ …  │ │21°/13° │ 55%    │ │
│ └─────────┘ └─────────┘    │ ├────────┼────────┤ │
│                            │ │풍속     │ 풍향    │ │
│ ④-1 다른 도시 14            │ │3.2 m/s │ ↘ 북서풍 │ │
│ (대전)(울산)(세종)(수원) …   │ └────────┴────────┘ │
│                            │ [새로고침]           │
│                            ├─────────────────────┤
│                            │ ⑥ 위치 (지도)        │
│                            │   📍서울 18°C  · · ·  │
└────────────────────────────┴─────────────────────┘
```

| 영역 | Bootstrap 구성 | 위치 |
|---|---|---|
| ① 상단 바 | 흰 `navbar border-bottom`, 로고 + 둥근 검색칸(돋보기 아이콘 안쪽, 버튼 없이 Enter) + 결과 `list-group` | 맨 위 |
| ② 대륙 | `nav nav-pills` 작은 크기 (JS로 `active` 클래스만 바꾼다) | ②③이 한 줄, 왼쪽 |
| ③ 나라 선택 | `form-select form-select-sm` (국기 + 이름, 가나다순) | ②③이 한 줄, 오른쪽 |
| ④ 도시 카드 | `row row-cols-2 row-cols-md-3 g-3` + `card` (앞 6개 도시) | `col-lg-7`, 모바일은 아래 |
| ④-1 다른 도시 | `btn btn-sm rounded-pill` 목록 (7번째 도시부터) | ④ 아래 |
| ⑤ 상세 날씨 | `card`, 2×2 `row g-2` 지표 칸, `spinner-border`, `alert` | `col-lg-5`, 모바일은 위(`order-first order-lg-last`) |
| ⑥ 지도 | `card` + Leaflet 지도 (높이 280~300px) | ⑤ 아래. PC에서는 ⑤⑥이 함께 `sticky` |

## 5. 기능 요구사항

### F1. API 키 (`js/config.js`)

```js
// OpenWeather API 키 (https://home.openweathermap.org/api_keys 에서 발급)
const API_KEY = 'YOUR_API_KEY';
```

- `API_KEY`가 비어 있거나 `'YOUR_API_KEY'` 그대로면 API를 호출하지 않고, ⑤ 자리에 `alert alert-info`로 안내한다:
  "js/config.js의 API_KEY에 OpenWeather API 키를 넣어주세요."

### F2. 대륙 (②)

- 6개 대륙: 아시아, 유럽, 북아메리카, 남아메리카, 아프리카, 오세아니아
- 대륙을 누르면 그 대륙의 기본 나라(`defaultCountry`, 예: 아시아 → 대한민국)를 선택하고 F3로 넘어간다.
- 모바일에서 대륙 버튼이 한 줄에 안 들어가면 가로 스크롤(`flex-nowrap overflow-auto`)되게 한다. 페이지 전체에 가로 스크롤이 생기면 안 된다.

### F3. 나라 선택 (③)

- 나라는 버튼이 아니라 **드롭다운(select)** 으로 고른다. 나라가 50개가 넘어도 상단이 한 줄로 유지된다.
- 항목은 국기 이모지 + 한글 이름(예: `🇰🇷 대한민국`), 가나다순이다.
- 나라를 고르면 그 나라의 **앞쪽 6개 도시 날씨를 동시에** 불러와 ④ 카드로 보여준다 (`Promise.all`, 1회 최대 6건).
- 나라를 바꾸면 그 나라의 **첫 번째 도시**가 ⑤에 자동으로 선택된다.

### F4. 도시 카드 (④)

- 각 카드: 도시 한글 이름, OpenWeather 날씨 아이콘, 현재 온도(정수 `°`), 날씨 설명(한국어)
- 날씨를 불러오는 동안 카드 안에 `placeholder-glow` 스켈레톤을 보여준다.
- 한 도시만 실패하면 그 카드에만 "불러오지 못했어요"와 다시 시도 버튼(`bi-arrow-clockwise`)을 보여준다. 다른 카드는 정상 표시한다.
- 카드를 누르면 ⑤에 그 도시 상세 날씨를 보여주고, 선택된 카드는 `border-primary border-2`로 표시한다.
- 모바일(`lg` 미만)에서 카드를 누르면 ⑤로 부드럽게 스크롤한다 (`scrollIntoView({ behavior: 'smooth' })`).
- 카드는 `button` 요소로 만들거나 `role="button"` + `tabindex="0"`을 달아 키보드(Enter)로도 고를 수 있게 한다.

### F4-1. 다른 도시 (④ 아래)

- 7번째 도시부터는 카드 아래에 `다른 도시 14`처럼 개수와 함께 둥근 작은 버튼(`btn-sm rounded-pill`)으로 보여준다.
- 이 도시들은 미리 날씨를 부르지 않는다. 누르면 그때 상세 패널과 지도에서 날씨를 불러온다 (호출 한도 절약).
- 선택된 버튼은 `btn-primary`로 표시한다.

### F5. 상세 날씨 (⑤)

표시 항목:

| 항목 | 값 | 표시 형식 |
|---|---|---|
| 도시 | 한글 이름 + 나라 이름 (검색한 도시는 "검색한 도시" 배지) | `서울, 대한민국` |
| 기준 시각 | `dt` + `timezone`으로 계산한 **현지 시각** | `현지 21:50 기준` |
| 현재 온도 | `main.temp` | `18°C` (정수 반올림), 큰 글씨 |
| 날씨 | `weather[0].description`, `weather[0].icon` | 아이콘 + `맑음` |
| 체감 온도 | `main.feels_like` | `체감 17°C` |
| 최고 / 최저 | F6 참고 | `21° / 13°` (최고는 빨강 `text-danger`, 최저는 파랑 `text-primary`) |
| 습도 | `main.humidity` | `55%` |
| 풍속 | `wind.speed` | `3.2 m/s` (소수 1자리) |
| 풍향 | `wind.deg` | 화살표 + 16방위 한글 (F7 참고) |

- 지표 4개(최고/최저, 습도, 풍속, 풍향)는 2×2 칸으로 보여준다. 칸마다 Bootstrap Icons를 단다: `bi-thermometer-half`, `bi-droplet`, `bi-wind`, `bi-compass`
- 카드 아래에 **새로고침** 버튼(`btn btn-outline-secondary btn-sm`, `bi-arrow-clockwise`)을 둔다. 누르면 캐시를 무시하고 그 도시를 다시 불러온다.
- 불러오는 동안 `spinner-border`를 보여준다.

### F6. 오늘 최고 / 최저 기온

Current Weather API의 `temp_max`/`temp_min`은 **그 시점에 도시 안에서 관측된 범위**라서 하루 최고/최저가 아니다. 그래서 상세 패널을 열 때 Forecast API를 한 번 더 불러 계산한다.

1. 도시의 현지 날짜를 구한다: `(Date.now()/1000 + timezone)`을 UTC 기준 날짜로 바꾼 `YYYY-MM-DD`
2. Forecast `list` 중 `(item.dt + city.timezone)`의 UTC 날짜가 현지 오늘인 항목만 고른다.
3. 그 항목들의 `main.temp_max` 최댓값, `main.temp_min` 최솟값에 **현재 온도**까지 넣어서 최고/최저를 정한다.
4. 고른 항목이 없거나(현지 밤 늦은 시간) Forecast 호출이 실패하면 Current Weather의 `temp_max`/`temp_min`을 대신 쓰고, 값 옆에 회색 작은 글씨로 "(현재 관측 범위)"를 붙인다.

- 도시 카드(④)에는 최고/최저를 보여주지 않는다. Forecast는 상세 패널을 열 때만 부른다 (호출 수 절약).

### F7. 풍향 표시

- `wind.deg`는 바람이 **불어오는** 방향(0° = 북쪽에서 불어옴)이다.
- 16방위 한글: `북, 북북동, 북동, 동북동, 동, 동남동, 남동, 남남동, 남, 남남서, 남서, 서남서, 서, 서북서, 북서, 북북서`
  - `index = Math.round(deg / 22.5) % 16`
- 화살표는 바람이 **불어가는** 방향을 가리킨다: `bi-arrow-up` 아이콘에 `transform: rotate((deg + 180)deg)`
- 표시 예: `↘ 북서풍 (315°)`
- `wind.deg`가 없으면 `-`를 보여준다.

### F8. API 호출 (`api.js`)

```
현재 날씨: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&lang=kr&appid={key}
예보:     https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&lang=kr&appid={key}
날씨 아이콘: https://openweathermap.org/img/wn/{icon}@2x.png
```

- 도시 이름이 아니라 **위도·경도**로 호출한다 (같은 이름의 다른 도시 문제 방지).
- `units=metric`(섭씨, m/s), `lang=kr`(한국어 설명)을 항상 붙인다.
- **캐시**: 응답을 메모리 `Map`에 `종류:lat,lon` 키로 10분 동안 보관한다. 10분 안에 다시 고르면 API를 부르지 않는다. 새로고침 버튼만 캐시를 무시한다.
- 무료 플랜 제한(분당 60회)을 넘지 않도록, 나라를 고를 때는 앞 6개 도시만 미리 불러오고 나머지는 누를 때 불러온다.

### F9. 전 세계 도시 검색 (① 상단 바)

- 입력하면 `cities.js` 목록에서 이름이 맞는 도시를 바로 보여준다 (API 호출 없음).
- Enter를 누르면 Geocoding API(`/geo/1.0/direct?q=…&limit=5`)로 전 세계에서 찾아 결과에 더한다. 목록 도시와 좌표가 거의 같은 결과는 뺀다.
- 결과 이름은 `local_names.ko`가 있으면 한글, 없으면 영어. 아래에 주/도와 나라를 함께 보여준다.
- 결과를 고르면 그 나라가 목록에 있을 때 해당 대륙·나라로 이동해 카드도 보여주고, 상세 패널에 그 도시를 보여준다. 목록에 없는 도시면 상세 패널에 "검색한 도시" 배지를 단다.
- 검색창 밖을 누르거나 Esc를 누르면 결과 목록을 닫는다.

### F10. 지도 (⑥, 상세 패널 아래)

- Leaflet + OpenStreetMap 지도를 상세 패널 아래 카드(`위치`)에 넣는다. 높이 280px(PC 300px). PC에서는 상세 패널과 함께 `sticky`.
- 선택한 도시에 핀을 꽂고, 핀 위에 항상 보이는 말풍선으로 `서울 14°C`를 보여준다 (날씨를 불러오기 전에는 이름만).
- 같은 나라의 다른 도시는 파란 테두리 점으로 표시하고, 마우스를 올리면 이름, 누르면 그 도시를 선택한다.
- 선택한 도시를 가운데 두고, 같은 나라 도시가 함께 보이는 줌(3~9)으로 맞춘다.
- 오른쪽 위 레이어 버튼으로 OpenWeather 날씨 레이어(기온·구름·강수)를 켜고 끌 수 있다 (API 키가 있을 때만).
- Leaflet을 못 불러오면 "지도를 불러오지 못했어요."만 보여주고 나머지는 정상 동작한다.

## 6. 데이터 (`cities.js`)

전 세계 **206개 나라·지역, 1,015개 도시**를 6대륙으로 나눠 넣는다. 큰 나라는 최대 20개(한국·미국·중국·일본·인도·러시아), 중간 나라는 8~15개, 작은 나라는 수도 위주로 넣는다.

| 대륙 | 나라 | 기본 선택 |
|---|---|---|
| 아시아 (중동·중앙아시아 포함) | 50 | 대한민국 |
| 유럽 (러시아·키프로스 포함) | 46 | 영국 |
| 북아메리카 (중미·카리브 포함) | 25 | 미국 |
| 남아메리카 | 13 | 브라질 |
| 아프리카 | 54 | 이집트 |
| 오세아니아 | 18 | 호주 |

- 도시 순서가 중요하다: **앞의 6개**는 카드로 바로 날씨를 불러오고, 나머지는 "다른 도시" 목록에 들어간다. 그래서 수도·대표 도시를 앞에 둔다.
- 좌표는 소수 2자리(약 1km 정밀도).

```js
// 도시는 [이름, 위도, 경도]. 국기는 국가 코드로 자동 생성한다.
country('KR', '대한민국', [['서울', 37.5665, 126.9780], ['부산', 35.1796, 129.0756], ...])
```

- 대륙마다 나라는 가나다순으로 정렬하고, 대륙을 누르면 `defaultCountry`가 선택된다.
- 목록에 없는 도시는 F9 도시 검색으로 찾는다.

## 7. 상태 설계 (`app.js`)

```js
const CARD_COUNT = 6;       // 카드로 바로 날씨를 불러오는 도시 수

let apiKey = '';            // config.js의 API 키 (없거나 'YOUR_API_KEY'면 '')
let continentId = 'asia';   // 선택된 대륙
let countryCode = 'KR';     // 선택된 나라
let cityIndex = 0;          // 선택된 도시 인덱스 (목록에 없는 검색 도시면 -1)
let selectedCity = null;    // 상세 패널·지도 도시: { name, lat, lon, code }
let cityWeather = [];       // 카드 6개 데이터: { status: 'idle'|'loading'|'ok'|'error', data, error }
let detail = null;          // 상세 패널: { status: 'nokey'|'loading'|'ok'|'error', current, forecast, error }
let searchResults = [];     // 도시 검색 결과: { name, sub, lat, lon, code }
let countryRequestId = 0;   // 늦게 온 이전 나라 응답 무시용
let detailRequestId = 0;    // 늦게 온 이전 도시 응답 무시용
let searchRequestId = 0;    // 늦게 온 이전 검색 응답 무시용
```

- 처음 열면 아시아 → 대한민국 → 서울이 선택된 상태다.
- 나라·도시·검색을 바꿀 때 해당 `...RequestId`를 올리고, 응답이 왔을 때 번호가 다르면 화면에 반영하지 않는다.

## 8. 함수 목록

`api.js`

| 함수 | 역할 |
|---|---|
| `fetchCurrent(lat, lon, key, force)` | 현재 날씨 조회 (캐시 사용, `force`면 무시) |
| `fetchForecast(lat, lon, key, force)` | 5일/3시간 예보 조회 (캐시 사용) |
| `searchCities(query, key)` | Geocoding API로 도시 검색 |
| `request(url)` | `fetch` 공통 처리, HTTP 상태별 에러 메시지로 바꿔서 `throw` |

`map.js`

| 함수 | 역할 |
|---|---|
| `initMap(id, key, onCityClick)` | 지도·날씨 레이어 만들기, 점 클릭 시 호출할 함수 등록 |
| `updateMap(city, countryCities, selectedIndex)` | 핀·점 다시 그리고 화면 맞추기 |
| `setMapWeather(text)` | 핀 말풍선에 `서울 14°C` 표시 |

`app.js`

| 함수 | 역할 |
|---|---|
| `init()` | `API_KEY` 읽기, 이벤트 연결, 첫 화면 그리기 |
| `selectContinent(id)` | 대륙 선택 → 기본 나라(`defaultCountry`) 선택 |
| `selectCountry(code)` | 나라 선택 → 앞 6개 도시 날씨 불러오기, 첫 도시 상세 |
| `selectCity(index)` | 도시 선택 → 지도 갱신, 상세 불러오기 |
| `searchWorld()` / `selectSearchResult(r)` | 전 세계 도시 검색, 결과 선택 (F9) |
| `loadCountryWeather()` | 도시 카드용 현재 날씨 동시 조회 |
| `loadDetail(force)` | 상세용 현재 날씨 + 예보 조회 |
| `getTodayMinMax(current, forecast)` | 오늘 최고/최저 계산 (F6) |
| `getWindDirection(deg)` | 16방위 한글 반환 (F7) |
| `formatLocalTime(dt, timezone)` | 현지 시각 `HH:mm` 반환 |
| `renderContinents()` / `renderCountries()` / `renderCities()` / `renderMoreCities()` / `renderDetail()` / `renderSearchResults()` | 각 영역 다시 그리기 |

- 대륙 버튼, 도시 카드, 다른 도시 버튼은 `data-id` / `data-index` 속성을 달고, 부모 요소 하나에 이벤트를 위임한다 (다시 그려도 동작하도록).
- API에서 받은 문자열(날씨 설명 등)을 `innerHTML`에 넣을 때는 이스케이프하거나 `textContent`를 쓴다.

## 9. 예외 처리

| 상황 | 동작 |
|---|---|
| API 키 없음 | API 호출 안 함, ⑤에 키 입력 안내 (F1) |
| 401 | "API 키가 올바르지 않거나 아직 활성화되지 않았어요. 새로 발급한 키는 활성화까지 최대 2시간이 걸려요." |
| 429 | "요청이 너무 많아요. 1분 뒤에 다시 시도해 주세요." |
| 네트워크 오류 | "인터넷 연결을 확인해 주세요." |
| 그 밖의 오류 | "날씨를 불러오지 못했어요. (코드 {status})" |
| Forecast만 실패 | 상세는 정상 표시, 최고/최저만 현재 관측 범위로 대체 (F6) |
| 나라를 빠르게 연속 변경 | 마지막에 고른 나라 결과만 표시 (`countryRequestId`) |
| 검색 결과 없음 | "…에 맞는 도시를 찾지 못했어요. 영어 이름으로도 검색해 보세요." |
| 지도 라이브러리 로드 실패 | 지도 칸에 "지도를 불러오지 못했어요.", 나머지는 정상 동작 |

- 에러는 ⑤에 `alert alert-danger`로, 카드 에러는 카드 안에 작게 보여준다.

## 10. 완료 기준 (테스트 체크리스트)

- [ ] `index.html`을 브라우저에서 바로 열면 콘솔 에러 없이 동작한다.
- [ ] HTML/CSS/JS가 `index.html`, `css/style.css`, `js/config.js`, `js/cities.js`, `js/api.js`, `js/map.js`, `js/app.js`로 나뉘어 있다.
- [ ] 키가 없을 때 안내가 보이고 API 요청이 나가지 않는다 (개발자 도구 Network 탭으로 확인).
- [ ] `config.js`에 키를 넣고 열면 서울 날씨가 바로 보인다.
- [ ] 잘못된 키를 넣으면 401 안내 문구가 보인다.
- [ ] "Hoi An", "전주"처럼 목록에 없는 도시를 검색해서 날씨를 볼 수 있다.
- [ ] 상단이 로고·검색 한 줄, 대륙·나라 선택 한 줄로 간결하게 보인다.
- [ ] 지도에 선택한 도시 핀과 기온이 보이고, 같은 나라 다른 도시 점을 누르면 그 도시로 바뀐다.
- [ ] 미국을 고르면 카드 6개와 "다른 도시 14" 버튼이 보이고, 댈러스를 누르면 상세·지도가 댈러스로 바뀐다.
- [ ] 6개 대륙이 모두 있고, 대륙을 누르면 기본 나라와 첫 도시가 자동으로 선택된다.
- [ ] 나라를 고르면 앞 6개 도시 카드가 온도·아이콘·설명과 함께 보인다.
- [ ] 상세 패널에 현재 온도, 체감 온도, 최고/최저, 습도, 풍속(m/s), 풍향(화살표 + 한글 방위 + 각도)이 보인다.
- [ ] 풍향 확인: `deg = 0`이면 "북풍"이고 화살표가 아래(↓)를, `deg = 90`이면 "동풍"이고 화살표가 왼쪽(←)을 가리킨다.
- [ ] 최고 ≥ 현재 온도 ≥ 최저 관계가 항상 맞다.
- [ ] 같은 도시를 10분 안에 다시 고르면 API 요청이 다시 나가지 않는다. 새로고침 버튼은 요청을 다시 보낸다.
- [ ] 기준 시각이 내 컴퓨터 시각이 아니라 그 도시의 현지 시각이다 (예: 런던은 서울보다 8~9시간 이르다).
- [ ] 키보드 Tab + Enter로 대륙, 나라, 도시를 고를 수 있다.
- [ ] 모바일 너비(375px)에서 가로 스크롤 없이 상세 패널 → 지도 → 카드 순으로 쌓여 보인다.

## 11. 범위 밖

- 즐겨찾기, 5일 예보 그래프, 섭씨/화씨 전환, 내 위치 날씨, 서버·프록시로 API 키 숨기기

## 12. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-10-05 | 최초 작성. 6대륙 28개 나라 89개 도시, 대륙 탭 → 나라 버튼 → 도시 카드 → 상세 날씨(현재·체감 온도, 최고/최저, 습도, 풍속, 풍향). API 키는 화면에서 입력 |
| v1.1 | 2026-10-05 | API 키를 화면 입력 대신 `js/config.js`의 `API_KEY` 상수로 변경 |
| v1.2 | 2026-10-05 | 전 세계 206개 나라·지역, 417개 도시로 확장. 상단 도시 검색(Geocoding API, F9) 추가. 나라 이름 찾기 추가 |
| v1.3 | 2026-10-05 | Leaflet + OpenStreetMap 지도 추가(F10): 위치 핀과 기온, 같은 나라 도시 점, 기온·구름·강수 날씨 레이어 |
| v1.4 | 2026-10-05 | 상단 디자인 간결화: 흰 navbar + 둥근 검색칸, 대륙은 작은 pill 버튼, 나라는 드롭다운으로 한 줄 배치 |
| v1.5 | 2026-10-05 | 도시를 1,015개로 확장(큰 나라 최대 20개). 카드는 앞 6개만 미리 불러오고 나머지는 "다른 도시" 목록(F4-1)에서 누를 때 불러오기. 문서 전체를 현재 코드에 맞게 정리 |
