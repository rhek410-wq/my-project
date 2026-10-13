// 카테고리·컬렉션 등 화면에서 쓰는 고정 목록 (상품 API가 생겨도 그대로 쓴다)

export const CATEGORIES = [
  { key: 'necklaces', label: 'Necklaces', ko: '목걸이' },
  { key: 'earrings', label: 'Earrings', ko: '귀걸이' },
  { key: 'bracelets', label: 'Bracelets', ko: '팔찌' },
  { key: 'rings', label: 'Rings', ko: '반지' },
]

export const COLLECTIONS = [
  { key: 'lumiere', label: 'Lumière', description: 'Light captured in polished gold — pieces made to catch the first light of day.' },
  { key: 'aube', label: 'Aube', description: 'Delicate lines inspired by dawn over the Seine, quiet and luminous.' },
  { key: 'etoile', label: 'Étoile', description: 'Star-cut stones set in fine silver for an understated evening sparkle.' },
  { key: 'perle', label: 'Perle', description: 'Freshwater pearls paired with modern, architectural settings.' },
  { key: 'signature', label: 'Signature', description: 'The house monogram, reimagined in timeless everyday forms.' },
  { key: 'jardin', label: 'Jardin', description: 'Botanical motifs drawn from Parisian gardens in bloom.' },
]

export const MATERIALS = ['14K Gold', '10K Gold', 'Silver 925', '18K Gold Plated']

// 카테고리별 옵션 (반지: 호수, 목걸이: 길이)
export const OPTIONS = {
  necklaces: { label: 'Length', values: ['40cm', '42cm', '45cm'] },
  rings: { label: 'Size', values: ['#7', '#9', '#11', '#13', '#15'] },
  bracelets: { label: 'Length', values: ['15cm', '16cm', '17cm'] },
  earrings: null,
}
