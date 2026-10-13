// 상품 mock 데이터. 서버에 상품 API가 생기면 이 파일과 server.js만 지우면 된다.
import { CATEGORIES, COLLECTIONS, MATERIALS } from '../catalog'

const NAMES = {
  necklaces: ['Solitaire Pendant', 'Fine Chain Necklace', 'Pearl Drop Necklace', 'Lariat Necklace', 'Medallion Necklace', 'Petite Heart Necklace', 'Station Necklace', 'Baguette Line Necklace', 'Twist Chain Necklace', 'Initial Charm Necklace', 'Double Layer Necklace', 'Crescent Necklace'],
  earrings: ['Hoop Earrings', 'Pearl Stud Earrings', 'Drop Earrings', 'Ear Cuff', 'Huggie Earrings', 'Chandelier Earrings', 'Petite Stud Earrings', 'Knot Earrings', 'Threader Earrings', 'Halo Stud Earrings', 'Linear Drop Earrings', 'Twist Hoop Earrings'],
  bracelets: ['Tennis Bracelet', 'Chain Bracelet', 'Bangle', 'Cuff Bracelet', 'Pearl Bracelet', 'Charm Bracelet', 'Link Bracelet', 'Rope Bracelet', 'Station Bracelet', 'Slim Bangle', 'Double Chain Bracelet', 'Signet Bracelet'],
  rings: ['Solitaire Ring', 'Eternity Band', 'Signet Ring', 'Stacking Ring', 'Pearl Ring', 'Halo Ring', 'Twist Band', 'Dome Ring', 'Couple Band', 'Baguette Ring', 'Open Ring', 'Cocktail Ring'],
}

const STONES = ['Lab Diamond', 'Cubic Zirconia', 'Freshwater Pearl', 'Moissanite', 'None']
const CODE = { necklaces: 'NK', earrings: 'ER', bracelets: 'BR', rings: 'RG' }

// 같은 결과가 나오도록 고정 시드 난수를 쓴다
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildProducts() {
  const rand = seeded(42)
  const list = []
  let id = 1
  CATEGORIES.forEach(({ key }) => {
    NAMES[key].forEach((base, i) => {
      const collection = COLLECTIONS[(i + key.length) % COLLECTIONS.length]
      const material = MATERIALS[Math.floor(rand() * MATERIALS.length)]
      const stone = STONES[Math.floor(rand() * STONES.length)]
      const goldWeight = material.includes('14K') ? 3.2 : material.includes('10K') ? 2.2 : 1
      const price = Math.round(((59000 + rand() * 240000) * goldWeight) / 1000) * 1000
      const discountRate = i % 5 === 0 ? 10 + Math.floor(rand() * 3) * 5 : 0
      const created = new Date(2026, 9, 10)
      created.setDate(created.getDate() - Math.floor(rand() * 120))
      list.push({
        id,
        code: `${CODE[key]}${String(1000 + id * 7)}`,
        name: `${collection.label} ${base}`,
        category: key,
        collection: collection.key,
        collectionLabel: collection.label,
        material,
        stone,
        price,
        discountRate,
        salePrice: discountRate ? Math.round((price * (100 - discountRate)) / 100 / 100) * 100 : price,
        salesCount: Math.floor(rand() * 900),
        reviewCount: Math.floor(rand() * 240),
        rating: Math.round((4 + rand()) * 10) / 10,
        quickDelivery: rand() > 0.55,
        createdAt: created.toISOString().slice(0, 19),
        description: `${collection.description} Crafted in ${material.toLowerCase()}${
          stone === 'None' ? '' : ` with ${stone.toLowerCase()}`
        }, finished by hand for a soft, lasting lustre.`,
        details: [
          `Material — ${material}`,
          `Stone — ${stone}`,
          'Hypoallergenic, nickel-free',
          'Comes in a signature gift box',
        ],
      })
      id++
    })
  })
  // 판매량 상위 12개 = BEST, 최근 등록 12개 = NEW
  const best = [...list].sort((a, b) => b.salesCount - a.salesCount).slice(0, 12).map((p) => p.id)
  const fresh = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12).map((p) => p.id)
  return list.map((p) => ({ ...p, isBest: best.includes(p.id), isNew: fresh.includes(p.id) }))
}

export const products = buildProducts()
