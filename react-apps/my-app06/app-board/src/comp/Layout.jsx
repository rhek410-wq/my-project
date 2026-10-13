import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { cartCount, useShopStore } from '../stores/shopStore'
import { getUser } from '../service/userService'
import { HeartIcon } from './ProductCard'
import { CATEGORIES, COLLECTIONS } from '../utils/catalog'
import { BRAND, FREE_SHIPPING_OVER, formatPrice } from '../utils/format'

// 상단 메뉴 (참고 쇼핑몰과 같은 순서). SHOP은 마우스를 올리면 카테고리가 펼쳐진다
const menus = [
  { to: '/best', label: 'Best' },
  { to: '/new', label: 'New In' },
  { to: '/shop', label: 'Shop', mega: true },
  { to: '/promotion', label: 'Promotion & Event' },
  { to: '/brand-story', label: 'Brand Story' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/quick', label: '[Quick Delivery]' },
]

const POPULAR = ['Pearl', 'Lab Diamond', '14K', 'Hoop', 'Signet', 'Silver', 'Tennis', 'Couple']

function SearchOverlay({ onClose }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const go = (keyword) => {
    if (!keyword.trim()) return
    navigate(`/search?q=${encodeURIComponent(keyword.trim())}`)
    onClose()
  }
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-canvas/97 backdrop-blur-sm" role="dialog" aria-label="검색">
      <div className="mx-auto w-full max-w-3xl px-4 pt-24 sm:pt-32">
        <div className="flex justify-end">
          <button onClick={onClose} className="eyebrow text-muted hover:text-ink">Close ✕</button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
          className="mt-6 flex items-end gap-4 border-b border-ink pb-3"
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for jewelry"
            className="display w-full bg-transparent text-3xl outline-none placeholder:text-muted/60 sm:text-4xl"
          />
          <button type="submit" className="eyebrow pb-2">Search</button>
        </form>
        <p className="eyebrow mt-10 text-muted">Popular Searches</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR.map((k) => (
            <button key={k} onClick={() => go(k)} className="border border-line px-3 py-1.5 text-xs hover:border-ink">
              {k}
            </button>
          ))}
        </div>
        <p className="eyebrow mt-10 text-muted">Collections</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link key={c.key} to={`/catalogue/${c.key}`} onClick={onClose} className="display text-xl hover:italic">
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const navClass = ({ isActive }) =>
  `eyebrow whitespace-nowrap py-1 transition-colors ${isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`

export default function Layout() {
  const token = useAuthStore((s) => s.token)
  const userId = useAuthStore((s) => s.userId)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const count = useShopStore((s) => cartCount(s.cart))
  const wishCount = useShopStore((s) => s.wishlist.length)
  const navigate = useNavigate()
  const location = useLocation()

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // 화면이 바뀌면 모바일 메뉴를 닫고 맨 위로 올린다
  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  // 내 정보 API(/me)가 없으므로 저장한 userId로 회원 상세를 불러와 이름을 표시한다
  useEffect(() => {
    if (!token || !userId || user) return
    getUser(userId)
      .then(setUser)
      .catch(() => {}) // 401은 api 인터셉터가 처리한다
  }, [token, userId, user, setUser])

  // 로그아웃 API는 없다. 저장된 토큰만 지운다
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const utilLink = 'eyebrow whitespace-nowrap text-ink/70 transition-colors hover:text-ink'

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="bg-ink px-4 py-2 text-center text-[10px] tracking-[0.12em] text-canvas uppercase sm:text-[11px] sm:tracking-[0.18em]">
        Complimentary shipping on orders over {formatPrice(FREE_SHIPPING_OVER)}
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 xl:h-20">
          <button
            className="xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.3">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>

          <Link to="/" className="display shrink-0 text-xl tracking-[0.24em] sm:text-2xl">
            {BRAND}
          </Link>

          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-8">
            {menus.map((m) =>
              m.mega ? (
                <div key={m.to} className="group relative">
                  <NavLink to={m.to} className={navClass}>
                    {m.label}
                  </NavLink>
                  <div className="invisible absolute top-full left-1/2 z-20 w-[520px] -translate-x-1/2 pt-7 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="grid grid-cols-2 gap-8 border border-line bg-canvas p-8 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)]">
                      <div>
                        <p className="eyebrow mb-4 text-muted">Item</p>
                        <ul className="space-y-2.5">
                          <li>
                            <Link to="/shop" className="display text-lg hover:italic">All Jewelry</Link>
                          </li>
                          {CATEGORIES.map((c) => (
                            <li key={c.key}>
                              <Link to={`/shop/${c.key}`} className="display text-lg hover:italic">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="eyebrow mb-4 text-muted">Collection</p>
                        <ul className="space-y-2.5">
                          {COLLECTIONS.map((c) => (
                            <li key={c.key}>
                              <Link to={`/catalogue/${c.key}`} className="display text-lg hover:italic">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink key={m.to} to={m.to} className={navClass}>
                  {m.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-4 sm:gap-5">

            <button onClick={() => setSearchOpen(true)} className={utilLink} aria-label="검색">
              <span className="hidden sm:inline">Search</span>
              <svg viewBox="0 0 24 24" className="size-[18px] sm:hidden" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </button>
            {token ? (
              <>
                <Link to="/mypage" className={`${utilLink} hidden sm:inline`} title={user?.userName ?? userId}>
                  My Page
                </Link>
                <button onClick={handleLogout} className={`${utilLink} hidden sm:inline`}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`${utilLink} hidden sm:inline`}>Login</Link>
            )}
            <Link to="/wishlist" className={`${utilLink} relative hidden md:inline`} aria-label={`위시리스트 ${wishCount}개`}>
              <HeartIcon className="size-[17px]" />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-2 grid size-3.5 place-items-center rounded-full bg-ink text-[8px] tracking-normal text-canvas">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className={utilLink}>
              Cart ({count})
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-line bg-canvas px-4 pt-4 pb-8 xl:hidden">
            <ul className="divide-y divide-line">
              {menus.map((m) => (
                <li key={m.to}>
                  <NavLink to={m.to} className="eyebrow block py-3.5">
                    {m.label}
                  </NavLink>
                  {m.mega && (
                    <div className="grid grid-cols-2 gap-2 pb-4 pl-3">
                      {CATEGORIES.map((c) => (
                        <Link key={c.key} to={`/shop/${c.key}`} className="display text-lg">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              {token ? (
                <>
                  <Link to="/mypage" className={utilLink}>My Page</Link>
                  <button onClick={handleLogout} className={utilLink}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={utilLink}>Login</Link>
                  <Link to="/signup" className={utilLink}>Join</Link>
                </>
              )}
              <Link to="/wishlist" className={utilLink}>Wishlist ({wishCount})</Link>
              <Link to="/board" className={utilLink}>Q&amp;A</Link>
            </div>
          </nav>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-line bg-subtle/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <p className="display text-xl tracking-[0.28em]">{BRAND}</p>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Fine jewelry, quietly made.
              <br />
              Designed in Seoul, inspired by Paris.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">Customer Center</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/board" className="hover:text-ink">Notice · Q&amp;A</Link></li>
              <li>Mon — Fri, 10:00 — 17:00</li>
              <li>Lunch 12:30 — 13:30</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Shopping Info</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/mypage" className="hover:text-ink">My Page</Link></li>
              <li><Link to="/cart" className="hover:text-ink">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-ink">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">About</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/brand-story" className="hover:text-ink">Brand Story</Link></li>
              <li><Link to="/catalogue" className="hover:text-ink">Catalogue</Link></li>
              <li><Link to="/promotion" className="hover:text-ink">Promotion &amp; Event</Link></li>
            </ul>
          </div>
        </div>
        <p className="border-t border-line py-6 text-center text-[10px] tracking-[0.2em] text-muted uppercase">
          © 2026 {BRAND}. Demo store — no real orders.
        </p>
      </footer>
    </div>
  )
}
