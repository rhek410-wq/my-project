import LottoBall from './LottoBall.jsx'
import { NUM_COUNT } from '../utils/lottoUtils.js'

// 게임 한 줄: 라벨, 종류 배지, 공 6칸, 오른쪽 버튼들(children)
function GameRow({ label, type, numbers = [], fixed = [], highlight = false, children }) {
  const badge = highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'

  return (
    <li className="flex items-center gap-1 sm:gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <span className="w-4 shrink-0 font-bold">{label}</span>
      <span className={`shrink-0 whitespace-nowrap sm:min-w-12 text-center text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0.5 rounded ${badge}`}>
        {type}
      </span>
      <div className="flex flex-1 min-w-0 gap-0.5 sm:gap-1.5">
        {Array.from({ length: NUM_COUNT }, (_, i) => (
          <LottoBall key={i} n={numbers[i]} fixed={fixed.includes(numbers[i])} />
        ))}
      </div>
      {children}
    </li>
  )
}

export default GameRow
