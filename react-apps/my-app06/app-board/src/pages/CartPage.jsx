import { Link, useNavigate } from 'react-router-dom'
import ProductArt from '../comp/ProductArt'
import { cartTotal, useShopStore } from '../stores/shopStore'
import { useAuthStore } from '../stores/authStore'
import { FREE_SHIPPING_OVER, SHIPPING_FEE, formatPrice } from '../utils/format'

// 장바구니 (브라우저에만 저장, 결제는 데모라 실제 주문하지 않는다)
export default function CartPage() {
  const cart = useShopStore((s) => s.cart)
  const setQty = useShopStore((s) => s.setQty)
  const remove = useShopStore((s) => s.removeFromCart)
  const clearCart = useShopStore((s) => s.clearCart)
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  const subtotal = cartTotal(cart)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE

  const checkout = () => {
    if (!token) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    if (window.confirm(`총 ${formatPrice(subtotal + shipping)} 를 주문할까요?\n(데모 쇼핑몰이라 실제 결제는 되지 않습니다)`)) {
      clearCart()
      alert('주문이 접수되었습니다. 감사합니다.')
      navigate('/')
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <p className="eyebrow text-muted">Shopping Bag</p>
        <h1 className="display text-4xl sm:text-5xl">Cart</h1>
      </header>

      {cart.length === 0 ? (
        <div className="space-y-6 py-16 text-center">
          <p className="text-sm text-muted">장바구니가 비어 있습니다.</p>
          <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-line border-y border-line">
            {cart.map((item) => (
              <li key={item.key} className="flex gap-4 py-6 sm:gap-6">
                <Link to={`/product/${item.product.id}`} className="w-24 shrink-0 sm:w-32">
                  <ProductArt product={item.product} />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div className="flex justify-between gap-4">
                    <div className="space-y-1">
                      <p className="eyebrow text-muted">{item.product.collectionLabel}</p>
                      <Link to={`/product/${item.product.id}`} className="block text-sm hover:underline underline-offset-4">
                        {item.product.name}
                      </Link>
                      {item.option && <p className="text-xs text-muted">Option: {item.option}</p>}
                    </div>
                    <button onClick={() => remove(item.key)} className="eyebrow h-fit text-muted hover:text-ink" aria-label="삭제">
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center border border-line text-sm">
                      <button onClick={() => setQty(item.key, item.qty - 1)} className="px-3 py-1" aria-label="수량 줄이기">−</button>
                      <span className="w-8 text-center">{item.qty}</span>
                      <button onClick={() => setQty(item.key, item.qty + 1)} className="px-3 py-1" aria-label="수량 늘리기">+</button>
                    </div>
                    <p className="text-sm">{formatPrice(item.product.salePrice * item.qty)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="card h-fit space-y-5">
            <p className="eyebrow">Order Summary</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{shipping ? formatPrice(shipping) : 'Free'}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4">
                <dt className="eyebrow">Total</dt>
                <dd className="display text-2xl">{formatPrice(subtotal + shipping)}</dd>
              </div>
            </dl>
            {shipping > 0 && (
              <p className="text-xs text-muted">
                {formatPrice(FREE_SHIPPING_OVER - subtotal)} more for complimentary shipping.
              </p>
            )}
            <button onClick={checkout} className="btn btn-primary w-full">
              {token ? 'Checkout' : 'Login to Checkout'}
            </button>
            <Link to="/shop" className="eyebrow block text-center text-muted hover:text-ink">Continue Shopping</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
