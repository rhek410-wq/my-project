// 서버 API 요청·응답 타입 (JSDoc). 필드는 FRONTEND_API_PROMPT.md 명세와 같다.

/** @typedef {'남자' | '여자'} Gender */

/**
 * 모든 에러 응답 형식
 * @typedef {object} ErrorResponse
 * @property {'VALIDATION_ERROR'|'INVALID_SORT'|'AUTH_REQUIRED'|'INVALID_CREDENTIALS'|'ACCESS_DENIED'|'NOT_FOUND'|'CONFLICT'} code
 * @property {string} message
 */

/**
 * Spring Page 응답 (number는 0부터 시작)
 * @template T
 * @typedef {object} Page
 * @property {T[]} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number
 * @property {number} size
 * @property {number} numberOfElements
 * @property {boolean} first
 * @property {boolean} last
 * @property {boolean} empty
 */

/**
 * @typedef {object} SignupRequest
 * @property {string} userId     4~50자
 * @property {string} password   8~100자
 * @property {string} userName   최대 50자
 * @property {string} birthDate  YYYY-MM-DD
 * @property {Gender} gender
 */

/**
 * @typedef {object} LoginRequest
 * @property {string} userId
 * @property {string} password
 */

/**
 * @typedef {object} LoginResponse
 * @property {string} accessToken
 * @property {'Bearer'} tokenType
 */

/**
 * @typedef {object} UserResponse
 * @property {string} userId
 * @property {string} userName
 * @property {string} birthDate
 * @property {Gender} gender
 * @property {string} roleCode   예 ROLE_USER
 * @property {string} roleName   예 사용자
 */

/**
 * password는 바꿀 때만 넣는다 (빈 문자열 금지)
 * @typedef {object} UserUpdateRequest
 * @property {string} userName
 * @property {string} birthDate
 * @property {Gender} gender
 * @property {string} [password]
 */

/**
 * 게시글 목록 항목 (writer는 작성자 이름)
 * @typedef {object} BoardSummaryResponse
 * @property {number} id
 * @property {string} title
 * @property {number} viewCount
 * @property {string} writer
 * @property {string} createdAt
 */

/**
 * 게시글 상세
 * @typedef {object} BoardResponse
 * @property {number} id
 * @property {string} title
 * @property {string} content
 * @property {number} viewCount
 * @property {string} writer
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} BoardRequest
 * @property {string} title    공백 불가, 최대 200자
 * @property {string} content  공백 불가
 */

/**
 * 게시글 목록 조회 조건 (page는 0부터)
 * @typedef {object} BoardSearchParams
 * @property {number} [page]
 * @property {number} [size]
 * @property {string} [sort]        예 createdAt,desc
 * @property {'title'|'writer'} [searchType]
 * @property {string} [keyword]
 */

export {}

// ---------- 상품 (mock 서버) ----------

/**
 * @typedef {'necklaces' | 'earrings' | 'bracelets' | 'rings'} Category
 * @typedef {'new' | 'name' | 'priceAsc' | 'priceDesc' | 'popular' | 'review'} ProductSort
 */

/**
 * @typedef {Object} ProductSearchParams
 * @property {number} [page]
 * @property {number} [size]
 * @property {ProductSort} [sort]
 * @property {Category} [category]
 * @property {string} [collection]
 * @property {'best' | 'new' | 'sale' | 'quick'} [tag]
 * @property {string} [material]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {string} [keyword]
 */

/**
 * @typedef {Object} ProductSummary
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {Category} category
 * @property {string} collection
 * @property {string} collectionLabel
 * @property {string} material
 * @property {string} stone
 * @property {number} price
 * @property {number} discountRate
 * @property {number} salePrice
 * @property {number} salesCount
 * @property {number} reviewCount
 * @property {number} rating
 * @property {boolean} quickDelivery
 * @property {boolean} isBest
 * @property {boolean} isNew
 * @property {string} createdAt
 */

/**
 * @typedef {ProductSummary & { description: string, details: string[] }} ProductResponse
 */
