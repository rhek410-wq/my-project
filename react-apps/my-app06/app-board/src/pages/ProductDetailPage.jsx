import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, getProducts } from '../service/productService'
import ProductArt from '../comp/ProductArt'
import { HeartIcon, Price, ProductGrid } from '../comp/ProductCard'
import { useShopStore } from '../stores/shopStore'
import { CATEGORIES, OPTIONS } from '../utils/catalog'
import { FREE_SHIPPING_OVER, LOADING_TEXT, formatPrice } from '../utils/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToCart = useShopStore((s) => s.addToCart)
  const toggleWish = useShopStore((s) => s.toggleWish)
  const wished = useShopStore((s) => s.wishlist.some((p) => p.id === Number(id)))

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [error, setError] = useState('')
  const [option, setOption] = useState('')
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let ignore = false
    setProduct(null)
    setError('')
    setOption('')
    setQty(1)
    setNotice('')
    getProduct(id)
      .then((p) => {
        if (ignore) return
        setProduct(p)
        return getProducts({ collection: p.collection, size: 5, sort: 'popular' }).then(
          (res) => !ignore && setRelated(res.content.filter((x) => x.id !== p.id).slice(0, 4))
        )
      })
      .catch((err) => !ignore && setError(err.code === 'NOT_FOUND' ? '상품을 찾을 수 없어요.' : err.message))
    return () => {
      ignore = true
    }
  }, [id])

  if (error)
    return (
      <div className="space-y-6 py-20 text-center">
        <p className="alert-error inline-block">{error}</p>
        <div>
          <Link to="/shop" className="btn btn-secondary">Back to Shop</Link>
        </div>
      </div>
    )
  if (!product) return <p className="py-20 text-center text-muted">{LOADING_TEXT}</p>

  const opt = OPTIONS[product.category]
  const cat = CATEGORIES.find((c) => c.key === product.category)

  const add = (goCart) => {
    if (opt && !option) {
      setNotice(`${opt.label}을(를) 선택해 주세요.`)
      return
    }
    addToCart(product, option, qty)
    if (goCart) navigate('/cart')
    else setNotice('장바구니에 담았습니다.')
  }

  return (
    <div className="space-y-24">
      <div className="space-y-8">
      <nav className="eyebrow flex gap-2 text-muted">
        <Link to="/" className="hover:text-ink">Home</Link>/
        <Link to={`/shop/${product.category}`} className="hover:text-ink">{cat?.label}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <ProductArt product={product} />

        <div className="space-y-8 md:py-6">
          <div className="space-y-3">
            <Link to={`/catalogue/${product.collection}`} className="eyebrow text-muted hover:text-ink">
              {product.collectionLabel}
            </Link>
            <h1 className="display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
            <p className="text-xs tracking-widest text-muted">{product.code}</p>
            <Price product={product} className="pt-2 text-base" />
            <p className="text-xs text-muted">
              ★ {product.rating} · {product.reviewCount} reviews
            </p>
          </div>

          <p className="text-sm leading-relaxed text-ink/80">{product.description}</p>

          {opt && (
            <div className="space-y-3">
              <p className="label">{opt.label}</p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setOption(v)
                      setNotice('')
                    }}
                    aria-pressed={option === v}
                    className={`min-w-14 border px-3 py-2 text-xs transition-colors ${
                      option === v ? 'border-ink bg-ink text-canvas' : 'border-line hover:border-ink'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="label">Quantity</p>
            <div className="inline-flex items-center border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2" aria-label="수량 줄이기">−</button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="px-4 py-2" aria-label="수량 늘리기">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-5 text-sm">
            <span className="label">Total</span>
            <span className="display text-2xl">{formatPrice(product.salePrice * qty)}</span>
          </div>

          {notice && <p className={notice.includes('담았') ? 'alert-success' : 'alert-error'}>{notice}</p>}

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <button onClick={() => add(true)} className="btn btn-primary">Buy Now</button>
            <button onClick={() => add(false)} className="btn btn-secondary">Add to Cart</button>
            <button
              onClick={() => toggleWish(product)}
              aria-pressed={wished}
              aria-label={wished ? '위시리스트에서 빼기' : '위시리스트에 담기'}
              className="btn btn-secondary px-4"
            >
              <HeartIcon filled={wished} />
            </button>
          </div>

          <ul className="space-y-2 border-t border-line pt-6 text-xs text-muted">
            {product.details.map((d) => (
              <li key={d}>— {d}</li>
            ))}
            <li>— {product.quickDelivery ? 'Quick delivery: ships today if ordered before 2pm' : 'Ships within 3–5 business days'}</li>
            <li>— Complimentary shipping over {formatPrice(FREE_SHIPPING_OVER)}</li>
          </ul>
        </div>
      </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-8">
          <h2 className="display text-center text-3xl">From the {product.collectionLabel} Collection</h2>
          <ProductGrid items={related} />
        </section>
      )}
    </div>
  )
}
