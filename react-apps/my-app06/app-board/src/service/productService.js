import shopApi from '../utils/shopApi'

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

/**
 * 상품 목록 (page는 0부터)
 * @param {import('../utils/types').ProductSearchParams} params
 * @returns {Promise<import('../utils/types').Page<import('../utils/types').ProductSummary>>}
 */
export async function getProducts(params = {}) {
  const res = await shopApi.get('/products', { params: cleanParams(params) })
  return res.data
}

/** @returns {Promise<import('../utils/types').ProductResponse>} */
export async function getProduct(id) {
  const res = await shopApi.get(`/products/${id}`)
  return res.data
}

/** 카테고리·컬렉션·소재 목록 */
export async function getProductMeta() {
  const res = await shopApi.get('/products/meta')
  return res.data
}
