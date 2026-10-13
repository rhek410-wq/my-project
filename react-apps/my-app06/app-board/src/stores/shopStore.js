import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 장바구니·위시리스트 (서버 API가 없어 브라우저에만 저장한다)
// cart: [{ key, product, option, qty }]  key = `${productId}:${option}`
// wishlist: [product]  (목록 화면에 바로 보여줄 수 있도록 요약 정보를 함께 저장)
export const useShopStore = create(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, option = '', qty = 1) =>
        set((s) => {
          const key = `${product.id}:${option}`
          const found = s.cart.find((i) => i.key === key)
          return {
            cart: found
              ? s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
              : [...s.cart, { key, product: summarize(product), option, qty }],
          }
        }),
      setQty: (key, qty) =>
        set((s) => ({ cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)) })),
      removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
      clearCart: () => set({ cart: [] }),

      isWished: (id) => get().wishlist.some((p) => p.id === id),
      toggleWish: (product) =>
        set((s) => ({
          wishlist: s.wishlist.some((p) => p.id === product.id)
            ? s.wishlist.filter((p) => p.id !== product.id)
            : [summarize(product), ...s.wishlist],
        })),
    }),
    { name: 'maison-shop' }
  )
)

// 상세 응답의 긴 설명은 빼고 저장한다
function summarize({ description, details, ...rest }) {
  return rest
}

export const cartCount = (cart) => cart.reduce((sum, i) => sum + i.qty, 0)
export const cartTotal = (cart) => cart.reduce((sum, i) => sum + i.product.salePrice * i.qty, 0)
