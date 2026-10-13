# app-board — MAISON ÉLAN

`react-apps02/app-board`를 복사해 만든 액세서리 쇼핑몰입니다. 자세한 내용은 [기획서.md](기획서.md)를 보세요.

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

- 회원가입·로그인·회원정보·Q&A는 실제 서버(`http://222.239.249.197:8080`)와 통신합니다. 서버에 CORS 설정이 없어서 개발 중에는 `vite.config.js`의 프록시를 씁니다.
- 상품 API는 서버에 아직 없어서 axios-mock-adapter가 응답합니다. 실제 API가 생기면 `.env`에서 `VITE_USE_PRODUCT_MOCK=false`로 바꾸세요.
- 장바구니·위시리스트는 브라우저(localStorage)에 저장됩니다.
