import { useEffect, useState } from 'react'
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom'
import { getProducts } from '../service/productService'
import { ProductGrid } from '../comp/ProductCard'
import Pagination from '../comp/Pagination'
import { CATEGORIES, COLLECTIONS, MATERIALS } from '../utils/catalog'
import { LOADING_TEXT } from '../utils/format'

const SORTS = [
  { value: 'new', label: 'New' },
  { value: 'popular', label: 'Popular' },
  { value: 'priceAsc', label: 'Price: Low' },
  { value: 'priceDesc', label: 'Price: High' },
  { value: 'name', label: 'Name' },
  { value: 'review', label: 'Reviews' },
]

const PRICES = [
  { value: '', label: 'All Prices' },
  { value: '0-100000', label: 'Under ₩100,000' },
  { value: '100000-300000', label: '₩100,000 — 300,000' },
  { value: '300000-600000', label: '₩300,000 — 600,000' },
  { value: '600000-', label: 'Over ₩600,000' },
]

const PAGE_SIZE = 12

// 메뉴별 상품 목록. mode: shop | best | new | quick | sale | catalogue | search
export default function ProductListPage({ mode = 'shop', eyebrow, title, intro }) {
  const { category, collection } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || (mode === 'best' ? 'popular' : 'new')
  const page = Number(searchParams.get('page')) || 0
  const material = searchParams.get('material') || ''
  const price = searchParams.get('price') || ''
  const keyword = searchParams.get('q') || ''

  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const cat = CATEGORIES.find((c) => c.key === category)
  const col = COLLECTIONS.find((c) => c.key === collection)

  useEffect(() => {
    const [minPrice, maxPrice] = price.split('-')
    const tag = { best: 'best', new: 'new', quick: 'quick', sale: 'sale' }[mode]
    setError('')
    let ignore = false
    getProducts({
      page,
      size: PAGE_SIZE,
      sort,
      category,
      collection,
      tag,
      material,
      minPrice,
      maxPrice,
      keyword: mode === 'search' ? keyword : undefined,
    })
      .then((res) => !ignore && setData(res))
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [mode, category, collection, sort, page, material, price, keyword])

  // 필터가 바뀌면 첫 페이지로
  const update = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const heading = mode === 'search' ? `“${keyword}”` : col?.label ?? cat?.label ?? title
  const sub = mode === 'search' ? 'Search Results' : cat ? 'Shop' : col ? 'Collection' : eyebrow
  const desc = col?.description ?? intro

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <p className="eyebrow text-muted">{sub}</p>
        <h1 className="display text-4xl sm:text-5xl">{heading}</h1>
        {desc && <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted">{desc}</p>}
      </header>

      {mode === 'shop' && (
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-y border-line py-4">
          <NavLink to="/shop" end className={({ isActive }) => `eyebrow ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`}>
            All
          </NavLink>
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.key}
              to={`/shop/${c.key}`}
              className={({ isActive }) => `eyebrow ${isActive ? 'text-ink underline underline-offset-8' : 'text-muted hover:text-ink'}`}
            >
              {c.label}
            </NavLink>
          ))}
        </nav>
      )}

      {mode === 'catalogue' && (
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-y border-line py-4">
          {COLLECTIONS.map((c) => (
            <NavLink
              key={c.key}
              to={`/catalogue/${c.key}`}
              className={({ isActive }) => `display text-lg ${isActive ? 'italic' : 'text-muted hover:text-ink'}`}
            >
              {c.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <p className="eyebrow text-muted">{data ? `${data.totalElements} Items` : ' '}</p>
        <div className="flex flex-wrap items-center gap-3">
          <select value={material} onChange={(e) => update('material', e.target.value)} className="input-box w-auto text-xs" aria-label="소재">
            <option value="">All Materials</option>
            {MATERIALS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={price} onChange={(e) => update('price', e.target.value)} className="input-box w-auto text-xs" aria-label="가격대">
            {PRICES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => update('sort', e.target.value)} className="input-box w-auto text-xs" aria-label="정렬">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {!data && !error && <p className="py-20 text-center text-muted">{LOADING_TEXT}</p>}
      {data && data.empty && (
        <div className="space-y-6 py-20 text-center">
          <p className="display text-2xl">No pieces found.</p>
          <Link to="/shop" className="btn btn-secondary">View All Jewelry</Link>
        </div>
      )}
      {data && !data.empty && <ProductGrid items={data.content} />}

      {data && (
        <div className="pt-4">
          <Pagination page={data.number} totalPages={data.totalPages} onChange={(p) => update('page', p ? String(p) : '')} />
        </div>
      )}
    </div>
  )
}
