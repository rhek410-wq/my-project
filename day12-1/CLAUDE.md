# React 프로젝트 가이드

이 문서는 React 프로젝트를 만들 때 따라야 할 기준이다. 모든 작업은 아래 규칙을 우선으로 한다.

## 1. 프로젝트 구성

- **빌드 도구**: Vite 기반으로 프로젝트를 생성한다.
- **프레임워크/언어**: React + JavaScript (TypeScript 사용 안 함)
  ```bash
  npm create vite@latest <project-name> -- --template react
  ```
- **CSS**: Tailwind CSS를 적용한다. (`tailwindcss`, `@tailwindcss/vite` 플러그인 사용)
  ```bash
  npm install tailwindcss @tailwindcss/vite
  ```
  - `vite.config.js`의 `plugins`에 `tailwindcss()` 추가
  - 메인 CSS 파일(`src/index.css`)에 `@import "tailwindcss";` 추가

## 2. 개발 서버 설정

- 포트는 **3000번**을 사용한다.
- 서버 시작 시 **브라우저가 자동으로 열리도록** 설정한다.

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
})
```

## 3. 린트 (oxlint)

- 린터는 **oxlint**를 사용한다.
- **사용하지 않는 변수(`no-unused-vars`)는 에러로 처리하지 않는다.**

```bash
npm install -D oxlint
```

```json
// .oxlintrc.json
{
  "rules": {
    "no-unused-vars": "off"
  }
}
```

```json
// package.json scripts
"lint": "oxlint"
```

## 4. 폴더 구조

| 용도 | 위치 |
| --- | --- |
| View (화면/페이지) | `src/pages/` |
| Component (컴포넌트) | `src/comp/` |
| Service 로직 | `src/service/` |
| 유틸 | `src/utils/` |
| 스토어 | `src/stores/` |

```
src/
├── pages/      # 화면(View)
├── comp/       # 컴포넌트
├── service/    # 서비스 로직
├── utils/      # 유틸 함수
└── stores/     # 상태 관리 스토어
```

## 5. 작업 규칙

1. **가이드에 없는 내용은 스스로 판단하지 않는다.**
2. **기존 파일 또는 코드를 임의로 수정하거나 삭제하지 않는다.**
3. **추가적인 요건이나 아이디어가 있으면 반드시 사용자에게 확인을 받고 진행한다.**
4. **판단이 필요하거나 절차가 필요한 작업은 반드시 사용자에게 확인을 받고 진행한다.**
5. 기능 구현에 필요한 **라이브러리는 스스로 설치해도 된다.**
