# app-board

mock-board(my-app05)를 복사해 실제 백엔드 REST API(Spring Boot, JWT)에 연동한 게시판입니다.
API 명세는 `../FRONTEND_API_PROMPT.md` 를 따릅니다.

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

- 서버에 CORS 설정이 없어서 개발 중에는 `vite.config.js` 의 프록시(`/api` → `http://222.239.249.197:8080`)를 씁니다.
- `.env` 의 `VITE_API_BASE_URL` 은 비워 두면 프록시를 사용하고, CORS가 열리면 서버 주소를 넣으면 됩니다.

## 구조

- `src/utils/api.js` 공통 axios 클라이언트 (토큰 주입, `AUTH_REQUIRED` 시 로그아웃, 에러 `{ code, message }` 정규화)
- `src/utils/types.js` 요청·응답 JSDoc 타입
- `src/utils/validation.js` 서버와 같은 클라이언트 검증 규칙
- `src/service/` authService · boardService · userService
