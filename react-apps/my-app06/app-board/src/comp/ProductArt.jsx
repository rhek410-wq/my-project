// 사진 대신 쓰는 상품 일러스트: 카테고리별 선화 + 소재 색 (골드/실버)
const METAL = {
  gold: { from: '#f6efe2', to: '#e9dcc3', stroke: '#a8875a' },
  silver: { from: '#f2f2f0', to: '#dedcd8', stroke: '#8a8780' },
}

function Shape({ category, stroke, stone }) {
  const gem = stone !== 'None'
  switch (category) {
    case 'necklaces':
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M28 22 C 34 70, 66 70, 72 22" />
          <path d="M31 22 C 37 64, 63 64, 69 22" strokeOpacity="0.35" />
          {gem ? <path d="M50 66 l5 6 -5 7 -5 -7 z" fill={stroke} fillOpacity="0.15" /> : <circle cx="50" cy="70" r="4" />}
        </g>
      )
    case 'earrings':
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <circle cx="36" cy="50" r="13" />
          <circle cx="64" cy="50" r="13" />
          {gem && <circle cx="36" cy="63" r="3" fill={stroke} fillOpacity="0.2" />}
          {gem && <circle cx="64" cy="63" r="3" fill={stroke} fillOpacity="0.2" />}
        </g>
      )
    case 'bracelets':
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <ellipse cx="50" cy="52" rx="26" ry="15" />
          <ellipse cx="50" cy="50" rx="26" ry="15" strokeOpacity="0.35" />
          {gem && <circle cx="50" cy="67" r="3" fill={stroke} fillOpacity="0.2" />}
        </g>
      )
    default:
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <ellipse cx="50" cy="58" rx="17" ry="17" />
          <ellipse cx="50" cy="58" rx="14" ry="14" strokeOpacity="0.35" />
          {gem ? <path d="M50 30 l7 6 -7 7 -7 -7 z" fill={stroke} fillOpacity="0.15" /> : <rect x="44" y="38" width="12" height="5" />}
        </g>
      )
  }
}

export default function ProductArt({ product, className = '' }) {
  const metal = product.material?.includes('Silver') ? METAL.silver : METAL.gold
  const gid = `g-${product.id}`
  return (
    <svg viewBox="0 0 100 100" className={`block aspect-square w-full ${className}`} role="img" aria-label={product.name}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={metal.from} />
          <stop offset="1" stopColor={metal.to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <Shape category={product.category} stroke={metal.stroke} stone={product.stone} />
    </svg>
  )
}
