import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../service/productService'
import { ProductGrid } from '../comp/ProductCard'
import ProductArt from '../comp/ProductArt'
import { CATEGORIES, COLLECTIONS } from '../utils/catalog'
import { BRAND } from '../utils/format'

// 카테고리 타일에 쓰는 대표 모양 (사진 대신)
const tileProduct = (key, i) => ({ id: `tile-${key}`, category: key, material: i % 2 ? 'Silver 925' : '14K Gold', stone: 'Lab Diamond', name: key })

function Section({ eyebrow, title, to, children }) {
  return (
    <section className="space-y-10">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div className="space-y-2">
          <p className="eyebrow text-muted">{eyebrow}</p>
          <h2 className="display text-3xl sm:text-4xl">{title}</h2>
        </div>
        {to && (
          <Link to={to} className="eyebrow link-underline shrink-0">
            View All
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default function HomePage() {
  const [best, setBest] = useState([])
  const [fresh, setFresh] = useState([])

  useEffect(() => {
    getProducts({ tag: 'best', sort: 'popular', size: 4 }).then((r) => setBest(r.content)).catch(() => {})
    getProducts({ tag: 'new', sort: 'new', size: 4 }).then((r) => setFresh(r.content)).catch(() => {})
  }, [])

  return (
    <div className="space-y-28 sm:space-y-36">
      {/* 히어로: 사진 없이 타이포그래피로 */}
      <section className="mx-[calc(50%-50vw)] -mt-10 border-b border-line bg-gradient-to-b from-gold-soft/70 to-canvas px-4 py-28 text-center sm:-mt-14 sm:py-40">
        <p className="eyebrow text-muted">Autumn — Winter 2026</p>
        <h1 className="display mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
          Quiet light,
          <br />
          <em>worn every day.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted">
          Fine jewelry in gold, silver and pearl — designed to be layered, gifted and kept.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/new" className="btn btn-primary">Discover New In</Link>
          <Link to="/shop" className="btn btn-secondary">Shop All</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Link key={c.key} to={`/shop/${c.key}`} className="group block">
            <div className="overflow-hidden">
              <ProductArt product={tileProduct(c.key, i)} className="transition-transform duration-700 group-hover:scale-[1.04]" />
            </div>
            <p className="display mt-4 text-center text-2xl group-hover:italic">{c.label}</p>
          </Link>
        ))}
      </section>

      <Section eyebrow="Most Loved" title="Best Sellers" to="/best">
        <ProductGrid items={best} />
      </Section>

      <section className="grid items-center gap-10 border-y border-line py-20 md:grid-cols-2">
        <div className="space-y-5 text-center md:text-left">
          <p className="eyebrow text-muted">The House</p>
          <h2 className="display text-4xl leading-tight sm:text-5xl">
            Made slowly,
            <br />
            meant to last.
          </h2>
        </div>
        <div className="space-y-6 text-center text-sm leading-relaxed text-muted md:text-left">
          <p>
            {BRAND} began with a single gold chain and a simple idea: jewelry should feel like a second skin. Every
            piece is polished by hand and finished with hypoallergenic metals.
          </p>
          <Link to="/brand-story" className="eyebrow link-underline text-ink">Our Story</Link>
        </div>
      </section>

      <Section eyebrow="Just Arrived" title="New In" to="/new">
        <ProductGrid items={fresh} />
      </Section>

      <Section eyebrow="Catalogue" title="The Collections" to="/catalogue">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link key={c.key} to={`/catalogue/${c.key}`} className="group space-y-3 bg-canvas p-8 transition-colors hover:bg-surface">
              <p className="display text-3xl group-hover:italic">{c.label}</p>
              <p className="text-xs leading-relaxed text-muted">{c.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}
