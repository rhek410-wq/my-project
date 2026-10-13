import MockAdapter from 'axios-mock-adapter'
import { CATEGORIES, COLLECTIONS, MATERIALS } from '../catalog'
import { products } from './products'

// 상품 API 가짜 서버. shopApi 인스턴스에만 붙으므로 회원·Q&A는 실제 서버로 간다.
// 응답 형식은 실제 서버와 같은 Spring Page / { code, message } 에러 형식을 따른다.
export function setupMockServer(instance) {
  const mock = new MockAdapter(instance, { delayResponse: 300 })

  const fail = (status, code, message) => [status, { code, message }]

  const SORTS = {
    new: (a, b) => b.createdAt.localeCompare(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name),
    priceAsc: (a, b) => a.salePrice - b.salePrice,
    priceDesc: (a, b) => b.salePrice - a.salePrice,
    popular: (a, b) => b.salesCount - a.salesCount,
    review: (a, b) => b.reviewCount - a.reviewCount,
  }

  const toPage = (all, page, size) => {
    const totalPages = Math.ceil(all.length / size)
    const content = all.slice(page * size, page * size + size)
    return {
      content,
      totalElements: all.length,
      totalPages,
      number: page,
      size,
      numberOfElements: content.length,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
    }
  }

  // GET /products?category=&collection=&tag=best|new|sale|quick&keyword=&material=&minPrice=&maxPrice=&sort=&page=&size=
  mock.onGet('/products').reply((config) => {
    const p = config.params || {}
    const sort = p.sort || 'new'
    if (!SORTS[sort]) return fail(400, 'INVALID_SORT', `정렬 값이 올바르지 않습니다: ${sort}`)
    const page = Math.max(0, Number(p.page) || 0)
    const size = Math.min(100, Math.max(1, Number(p.size) || 12))
    const keyword = (p.keyword || '').trim().toLowerCase()

    const filtered = products.filter((item) => {
      if (p.category && item.category !== p.category) return false
      if (p.collection && item.collection !== p.collection) return false
      if (p.material && item.material !== p.material) return false
      if (p.minPrice && item.salePrice < Number(p.minPrice)) return false
      if (p.maxPrice && item.salePrice > Number(p.maxPrice)) return false
      if (p.tag === 'best' && !item.isBest) return false
      if (p.tag === 'new' && !item.isNew) return false
      if (p.tag === 'sale' && !item.discountRate) return false
      if (p.tag === 'quick' && !item.quickDelivery) return false
      if (keyword) {
        const text = `${item.name} ${item.collectionLabel} ${item.material} ${item.stone} ${item.code}`.toLowerCase()
        if (!text.includes(keyword)) return false
      }
      return true
    })

    const summaries = filtered.sort(SORTS[sort]).map(({ description, details, ...rest }) => rest)
    return [200, toPage(summaries, page, size)]
  })

  // GET /products/:id
  mock.onGet(/^\/products\/\d+$/).reply((config) => {
    const id = Number(config.url.split('/').pop())
    const item = products.find((x) => x.id === id)
    return item ? [200, item] : fail(404, 'NOT_FOUND', '상품을 찾을 수 없습니다.')
  })

  // GET /products/meta : 카테고리·컬렉션·소재 목록 (필터 UI 용)
  mock.onGet('/products/meta').reply(() => [200, { categories: CATEGORIES, collections: COLLECTIONS, materials: MATERIALS }])

  return mock
}
