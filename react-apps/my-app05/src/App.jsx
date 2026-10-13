import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './comp/Layout'
import PrivateRoute from './comp/PrivateRoute'
import AdminRoute from './comp/AdminRoute'
import LoginPage from './pages/LoginPage'
import BoardListPage from './pages/BoardListPage'
import BoardDetailPage from './pages/BoardDetailPage'
import BoardFormPage from './pages/BoardFormPage'
import MemberListPage from './pages/MemberListPage'
import MemberFormPage from './pages/MemberFormPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          {/* 첫 화면: 게시글 목록 (로그인 없이 볼 수 있음) */}
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />

          {/* 로그인 필요 */}
          <Route element={<PrivateRoute />}>
            <Route path="/board/new" element={<BoardFormPage />} />
            <Route path="/board/:id/edit" element={<BoardFormPage />} />
            <Route path="/members" element={<MemberListPage />} />
            <Route element={<AdminRoute redirect="/members" />}>
              <Route path="/members/new" element={<MemberFormPage />} />
              <Route path="/members/:id/edit" element={<MemberFormPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/board" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
