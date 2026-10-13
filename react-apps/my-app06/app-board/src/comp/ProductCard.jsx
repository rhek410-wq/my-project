import { Link } from 'react-router-dom'
import ProductArt from './ProductArt'
import { useShopStore } from '../stores/shopStore'
import { formatPrice } from '../utils/format'

export function HeartIcon({ filled, className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

export function Price({ product, className = '' }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 text-sm ${className}`}>
      {product.discountRate > 0 && <span className="font-medium text-gold">{product.discountRate}%</span>}
      <span>{formatPrice(product.salePrice)}</span>
      {product.discountRate > 0 && <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>}
    </p>
  )
}

export default function ProductCard({ product }) {
  const wished = useShopStore((s) => s.wishlist.some((p) => p.id === product.id))
  const toggleWish = useShopStore((s) => s.toggleWish)

  return (
    <article className="group relative">
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <ProductArt product={product} className="transition-transform duration-700 group-hover:scale-[1.04]" />
      </Link>
      <button
        onClick={() => toggleWish(product)}
        aria-label={wished ? '위시리스트에서 빼기' : '위시리스트에 담기'}
        aria-pressed={wished}
        className="absolute top-3 right-3 text-ink/70 transition-colors hover:text-ink"
      >
        <HeartIcon filled={wished} className="size-[18px]" />
      </button>
      <div className="mt-4 space-y-1.5">
        <p className="eyebrow text-muted">{product.collectionLabel}</p>
        <Link to={`/product/${product.id}`} className="block text-sm leading-snug hover:underline underline-offset-4">
          {product.name}
        </Link>
        <Price product={product} />
        <div className="flex flex-wrap gap-1 pt-0.5">
          {product.isNew && <span className="badge">New</span>}
          {product.isBest && <span className="badge">Best</span>}
          {product.quickDelivery && <span className="badge">Quick</span>}
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ items, cols = 'lg:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 ${cols}`}>
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
