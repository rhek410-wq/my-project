import { Link } from 'react-router-dom'
import { ProductGrid } from '../comp/ProductCard'
import { useShopStore } from '../stores/shopStore'

export default function WishlistPage() {
  const wishlist = useShopStore((s) => s.wishlist)

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <p className="eyebrow text-muted">Saved Pieces</p>
        <h1 className="display text-4xl sm:text-5xl">Wishlist</h1>
      </header>
      {wishlist.length === 0 ? (
        <div className="space-y-6 py-16 text-center">
          <p className="text-sm text-muted">마음에 드는 상품의 ♡ 를 눌러 담아 보세요.</p>
          <Link to="/best" className="btn btn-secondary">Explore Best Sellers</Link>
        </div>
      ) : (
        <ProductGrid items={wishlist} />
      )}
    </div>
  )
}
