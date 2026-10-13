# 게시판 프런트엔드 API 연동 프롬프트

> 아래 내용을 그대로 AI 코딩 도구(Claude Code 등)에 붙여넣어 사용하세요.

---

너는 프런트엔드 개발자다. 아래 명세의 백엔드 REST API(Spring Boot, JWT 인증)에 연동하는 게시판 프런트엔드를 구현/수정해줘.
현재 프로젝트의 프레임워크·스타일·폴더 구조를 먼저 파악하고, 그 관례에 맞춰 작성해. 명세에 없는 필드나 엔드포인트를 임의로 만들지 마.

## 1. 공통 사항

- **Base URL**: `http://222.239.249.197:8080`  (환경변수로 분리: 예 `VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`)
- 모든 API 경로는 `/api/v1` 으로 시작
- 요청/응답 모두 `Content-Type: application/json` (UTF-8)
- Swagger UI: `http://222.239.249.197:8080/swagger-ui.html`

### 인증 (JWT)
- 로그인 성공 시 `accessToken` 발급 (유효시간 **1시간**, refresh token 없음)
- 인증이 필요한 요청에는 헤더 추가: `Authorization: Bearer {accessToken}`
- 토큰 만료/누락 시 `401 AUTH_REQUIRED` → 토큰 삭제 후 로그인 화면으로 이동
- JWT의 `sub` 클레임에 로그인한 `userId`가 들어있음 (본인 여부 판단에 사용 가능). 로그인 시 입력한 userId를 함께 저장해도 됨
- axios/fetch 공통 클라이언트를 만들어 토큰 주입과 401 처리를 인터셉터에서 일괄 처리할 것

### 인증 필요 여부
| 구분 | 인증 |
|---|---|
| `POST /api/v1/auth/**` | 불필요 |
| `GET /api/v1/boards`, `GET /api/v1/boards/{id}` | 불필요 |
| 그 외 전부 (게시글 작성/수정/삭제, 회원 API 전체) | **필요** |

### 공통 에러 응답 형식
모든 에러는 아래 형식으로 내려온다. 화면에는 `message`를 보여주고, 분기 처리는 `code`로 할 것.
```json
{ "code": "VALIDATION_ERROR", "message": "userId: 아이디는 필수입니다, password: 비밀번호는 필수입니다" }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 입력값 검증 실패. message는 `필드명: 메시지, 필드명: 메시지` 형태 |
| 400 | `INVALID_SORT` | 정렬 파라미터의 필드명이 잘못됨 |
| 401 | `AUTH_REQUIRED` | 토큰 없음/만료/위조 |
| 401 | `INVALID_CREDENTIALS` | 로그인 아이디 또는 비밀번호 불일치 |
| 403 | `ACCESS_DENIED` | 본인 리소스가 아님 (타인 글 수정/삭제, 타인 정보 수정/탈퇴) |
| 404 | `NOT_FOUND` | 게시글/회원 없음 |
| 409 | `CONFLICT` | 회원가입 시 아이디 중복 |

### 데이터 타입 규칙
- 날짜(`birthDate`): `"YYYY-MM-DD"` 문자열 (예 `"1990-05-20"`)
- 일시(`createdAt`, `updatedAt`): 타임존 없는 ISO-8601 문자열, 서버 로컬시간(KST) 기준 (예 `"2026-08-15T22:38:08.342277"`). 소수점 자릿수가 가변이므로 파싱 시 주의
- 성별(`gender`): 한글 enum 문자열 **`"남자"` 또는 `"여자"`** 만 허용

### 페이지 응답 형식 (Spring `Page`)
목록 API는 아래 구조로 응답한다. 프런트에서 주로 쓰는 필드: `content`, `totalElements`, `totalPages`, `number`(현재 페이지, **0부터 시작**), `size`, `first`, `last`.
```json
{
  "content": [ /* 항목 배열 */ ],
  "totalElements": 27,
  "totalPages": 14,
  "number": 0,
  "size": 2,
  "numberOfElements": 2,
  "first": true,
  "last": false,
  "empty": false,
  "pageable": { "offset": 0, "pageNumber": 0, "pageSize": 2, "paged": true, "unpaged": false,
                "sort": { "empty": false, "sorted": true, "unsorted": false } },
  "sort": { "empty": false, "sorted": true, "unsorted": false }
}
```

---

## 2. Auth API

### 2-1. 회원가입
`POST /api/v1/auth/signup` · 인증 불필요 · 성공 **201 Created**

Request
```json
{
  "userId": "hong123",
  "password": "password123",
  "userName": "홍길동",
  "birthDate": "1990-05-20",
  "gender": "남자"
}
```
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| userId | string | O | 4~50자 |
| password | string | O | 8~100자 |
| userName | string | O | 최대 50자 |
| birthDate | string(date) | O | `YYYY-MM-DD` |
| gender | string | O | `"남자"` \| `"여자"` |

Response (201)
```json
{
  "userId": "hong123",
  "userName": "홍길동",
  "birthDate": "1990-05-20",
  "gender": "남자",
  "roleCode": "ROLE_USER",
  "roleName": "사용자"
}
```
에러: 400 `VALIDATION_ERROR`, 409 `CONFLICT`(아이디 중복)

### 2-2. 로그인
`POST /api/v1/auth/login` · 인증 불필요 · 성공 **200**

Request
```json
{ "userId": "hong123", "password": "password123" }
```
Response (200)
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiJ9...", "tokenType": "Bearer" }
```
에러: 400 `VALIDATION_ERROR`, 401 `INVALID_CREDENTIALS`

> 로그아웃 API는 없음. 클라이언트에서 저장된 토큰을 삭제하면 됨.

---

## 3. Board API

### BoardSummaryResponse (목록 항목)
```json
{ "id": 49, "title": "제목", "viewCount": 6, "writer": "홍길동", "createdAt": "2026-08-15T22:38:08.342277" }
```

### BoardResponse (상세)
```json
{
  "id": 49,
  "title": "제목",
  "content": "본문 내용",
  "viewCount": 7,
  "writer": "홍길동",
  "createdAt": "2026-08-15T22:38:08.342277",
  "updatedAt": "2026-08-15T22:40:11.120000"
}
```
> ⚠️ `writer`는 작성자의 **이름(userName)** 이며 userId가 아님. 응답에 작성자 userId가 없으므로, 수정/삭제 버튼 노출 여부를 프런트에서 정확히 판단할 수 없음. 버튼은 로그인 상태에서 노출하되, 서버의 `403 ACCESS_DENIED` 응답을 받으면 "작성자만 수정/삭제할 수 있습니다" 안내를 띄울 것.

### 3-1. 게시글 목록 조회 (검색/페이징/정렬)
`GET /api/v1/boards` · 인증 불필요 · 200 · 응답: `Page<BoardSummaryResponse>`

| Query | 타입 | 기본값 | 설명 |
|---|---|---|---|
| page | int | 0 | 페이지 번호 (0부터) |
| size | int | 10 | 페이지 크기 |
| sort | string | `createdAt,desc` | `필드명,asc\|desc` 형식. 사용 가능 필드: `id`, `title`, `viewCount`, `createdAt`, `updatedAt` |
| searchType | string | - | `title`(기본) \| `writer` (작성자 이름 부분일치) |
| keyword | string | - | 검색어. 비어있으면 전체 조회. 대소문자 무시 부분일치 |

예시: `GET /api/v1/boards?page=0&size=10&sort=viewCount,desc&searchType=writer&keyword=홍`

에러: 400 `INVALID_SORT`

### 3-2. 게시글 상세 조회
`GET /api/v1/boards/{id}` · 인증 불필요 · 200 · 응답: `BoardResponse`

> 호출할 때마다 **조회수가 1 증가**함. 수정 화면 진입 등에서 불필요하게 중복 호출하지 않도록 주의 (React StrictMode의 이중 호출 포함).

에러: 404 `NOT_FOUND`

### 3-3. 게시글 작성
`POST /api/v1/boards` · **인증 필요** · 성공 **201 Created** · 응답: `BoardResponse`

Request
```json
{ "title": "제목", "content": "본문 내용" }
```
| 필드 | 필수 | 검증 |
|---|---|---|
| title | O | 공백 불가, 최대 200자 |
| content | O | 공백 불가 |

에러: 400 `VALIDATION_ERROR`, 401 `AUTH_REQUIRED`

### 3-4. 게시글 수정 (작성자 본인만)
`PUT /api/v1/boards/{id}` · **인증 필요** · 200 · 응답: `BoardResponse`

Request: 작성과 동일 (`title`, `content` 둘 다 필수)

에러: 400, 401, 403 `ACCESS_DENIED`, 404

### 3-5. 게시글 삭제 (작성자 본인만)
`DELETE /api/v1/boards/{id}` · **인증 필요** · 성공 **204 No Content** (응답 본문 없음 — JSON 파싱하지 말 것)

에러: 401, 403 `ACCESS_DENIED`, 404

---

## 4. User API (전부 인증 필요)

### UserResponse
```json
{
  "userId": "hong123",
  "userName": "홍길동",
  "birthDate": "1990-05-20",
  "gender": "남자",
  "roleCode": "ROLE_USER",
  "roleName": "사용자"
}
```

### 4-1. 회원 목록 조회
`GET /api/v1/users` · 200 · 응답: `Page<UserResponse>` (userId 오름차순 고정 정렬)

| Query | 타입 | 기본값 | 설명 |
|---|---|---|---|
| page | int | 0 | 0부터 |
| size | int | 10 | |
| keyword | string | - | 이름(userName) 부분일치 검색 |

### 4-2. 회원 상세 조회
`GET /api/v1/users/{userId}` · 200 · 응답: `UserResponse` · 에러: 404

> 내 정보 조회 전용 API(`/me`)는 없음. 로그인 시 저장한 userId(또는 JWT `sub`)로 이 API를 호출할 것.

### 4-3. 회원 정보 수정 (본인만)
`PUT /api/v1/users/{userId}` · 200 · 응답: `UserResponse`

Request
```json
{
  "userName": "홍길동",
  "birthDate": "1990-05-20",
  "gender": "여자",
  "password": "newPassword123"
}
```
| 필드 | 필수 | 검증 |
|---|---|---|
| userName | O | 최대 50자 |
| birthDate | O | `YYYY-MM-DD` |
| gender | O | `"남자"` \| `"여자"` |
| password | X | 8~100자. **변경하지 않으려면 필드를 빼거나 `null`로 보낼 것** (빈 문자열 `""`은 검증 실패) |

에러: 400, 401, 403 `ACCESS_DENIED`(타인 정보), 404

### 4-4. 회원 탈퇴 (본인만)
`DELETE /api/v1/users/{userId}` · 성공 **204 No Content**

> 탈퇴 시 해당 회원이 작성한 게시글도 함께 삭제됨 → 확인 모달에 안내 문구 표시. 성공 후 토큰 삭제 및 로그아웃 처리.

에러: 401, 403, 404

---

## 5. 개발 환경 주의사항 (CORS)

현재 서버에 **CORS 설정이 없어** 브라우저에서 다른 Origin(예 `http://localhost:5173`)으로 직접 호출하면 preflight(OPTIONS)가 401로 막힌다.
백엔드에서 CORS가 열리기 전까지는 개발 서버 프록시를 사용할 것:

- Vite 예시 (`vite.config.ts`)
  ```ts
  server: { proxy: { '/api': { target: 'http://222.239.249.197:8080', changeOrigin: true } } }
  ```
  이 경우 개발 중 API Base URL은 빈 문자열(상대경로 `/api/v1/...`)로 둔다.
- Next.js는 `next.config.js`의 `rewrites`로 동일하게 처리.

## 6. 구현 체크리스트
- [ ] API 클라이언트 모듈 (baseURL 환경변수, 토큰 주입, 401 시 로그아웃, 에러 `{code, message}` 정규화)
- [ ] 위 Request/Response를 TypeScript 타입(또는 JSDoc)으로 정의 (`Gender = '남자' | '여자'`, `Page<T>`)
- [ ] 회원가입 / 로그인 / 로그아웃
- [ ] 게시글 목록(페이징·정렬·검색) / 상세 / 작성 / 수정 / 삭제
- [ ] 회원 목록 / 상세 / 내 정보 수정 / 탈퇴
- [ ] 204 응답 처리, 0-based 페이지 번호를 UI의 1-based로 변환
- [ ] 클라이언트 검증 규칙을 서버 검증과 동일하게 맞추기
