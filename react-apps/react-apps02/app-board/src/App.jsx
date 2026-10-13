import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './comp/Layout'
import PrivateRoute from './comp/PrivateRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import BoardListPage from './pages/BoardListPage'
import BoardDetailPage from './pages/BoardDetailPage'
import BoardFormPage from './pages/BoardFormPage'
import MemberListPage from './pages/MemberListPage'
import MemberDetailPage from './pages/MemberDetailPage'
import MemberFormPage from './pages/MemberFormPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          {/* 첫 화면: 게시글 목록 (로그인 없이 볼 수 있음) */}
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />

          {/* 로그인 필요: 게시글 작성·수정, 회원 API 전체 */}
          <Route element={<PrivateRoute />}>
            <Route path="/board/new" element={<BoardFormPage />} />
            <Route path="/board/:id/edit" element={<BoardFormPage />} />
            <Route path="/members" element={<MemberListPage />} />
            <Route path="/members/:userId" element={<MemberDetailPage />} />
            <Route path="/members/:userId/edit" element={<MemberFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/board" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
