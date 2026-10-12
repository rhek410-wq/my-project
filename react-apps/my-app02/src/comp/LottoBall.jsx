import { ballColorClass } from '../utils/lottoUtils.js'

const SIZES = {
  lg: 'w-10 h-10 text-base', // 당첨번호
  row: 'flex-1 min-w-0 max-w-9 aspect-square text-[11px] sm:text-sm', // 게임 줄 (좁은 화면에서는 줄어듦)
}

// 로또 공 하나 (n이 없으면 빈 칸)
function LottoBall({ n, fixed = false, size = 'row' }) {
  const base = `${SIZES[size]} shrink-0 rounded-full inline-flex items-center justify-center font-bold`

  if (n === undefined) {
    return <span className={`${base} bg-gray-200 text-gray-400`}>?</span>
  }

  const ring = fixed ? 'ring-2 ring-blue-600 sm:ring-offset-2' : ''
  return <span className={`${base} ${ballColorClass(n)} text-white ${ring}`}>{n}</span>
}

export default LottoBall
