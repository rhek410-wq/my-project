import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './comp/Layout'
import PrivateRoute from './comp/PrivateRoute'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import BrandStoryPage from './pages/BrandStoryPage'
import BoardListPage from './pages/BoardListPage'
import BoardDetailPage from './pages/BoardDetailPage'
import BoardFormPage from './pages/BoardFormPage'
import MemberListPage from './pages/MemberListPage'
import MemberDetailPage from './pages/MemberDetailPage'
import MemberFormPage from './pages/MemberFormPage'

// 마이페이지 = 내 회원 정보
function MyPage() {
  const userId = useAuthStore((s) => s.userId)
  return <Navigate to={`/members/${encodeURIComponent(userId)}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 상품 (mock 서버) */}
          <Route path="/best" element={<ProductListPage key="best" mode="best" eyebrow="Most Loved" title="Best" intro="The pieces our clients return to again and again." />} />
          <Route path="/new" element={<ProductListPage key="new" mode="new" eyebrow="Just Arrived" title="New In" intro="The latest additions to the house." />} />
          <Route path="/shop" element={<ProductListPage key="shop" mode="shop" eyebrow="Shop" title="All Jewelry" />} />
          <Route path="/shop/:category" element={<ProductListPage key="shop" mode="shop" />} />
          <Route path="/catalogue" element={<ProductListPage key="catalogue" mode="catalogue" eyebrow="Catalogue" title="The Collections" intro="Six collections, one quiet signature." />} />
          <Route path="/catalogue/:collection" element={<ProductListPage key="catalogue" mode="catalogue" />} />
          <Route path="/promotion" element={<ProductListPage key="sale" mode="sale" eyebrow="Promotion & Event" title="The Season’s Edit" intro="Selected pieces at a special price, for a limited time." />} />
          <Route path="/quick" element={<ProductListPage key="quick" mode="quick" eyebrow="Quick Delivery" title="Ships Today" intro="Order before 2pm and your piece leaves our atelier the same day." />} />
          <Route path="/search" element={<ProductListPage key="search" mode="search" />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/brand-story" element={<BrandStoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Q&A 게시판 (실제 서버, 조회는 로그인 없이) */}
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />

          {/* 로그인 필요: 글쓰기·수정, 회원 API 전체 */}
          <Route element={<PrivateRoute />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/board/new" element={<BoardFormPage />} />
            <Route path="/board/:id/edit" element={<BoardFormPage />} />
            <Route path="/members" element={<MemberListPage />} />
            <Route path="/members/:userId" element={<MemberDetailPage />} />
            <Route path="/members/:userId/edit" element={<MemberFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
