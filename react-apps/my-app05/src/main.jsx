import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupMockServer } from './utils/mock/server'

// 서버가 없으므로 mock 서버를 켠다. 실제 서버가 생기면 이 줄을 지운다.
setupMockServer()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
