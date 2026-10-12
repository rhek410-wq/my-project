import LottoBall from './LottoBall.jsx'
import { LATEST_DRAW } from '../service/latestDraw.js'
import { getExpectedRound } from '../service/lottoService.js'
import { formatPrize } from '../utils/lottoUtils.js'

// ② 지난주 당첨번호
function LatestDrawCard() {
  const draw = LATEST_DRAW
  // 저장된 회차가 오래됐는지 확인
  const outdated = getExpectedRound(new Date()) > draw.round

  return (
    <section className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4">
      <h2 className="font-bold mb-3">
        지난주 당첨번호{' '}
        <span className="font-normal text-gray-500">
          · 제{draw.round}회 ({draw.date.replaceAll('-', '.')})
        </span>
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {draw.numbers.map((n) => (
            <LottoBall key={n} n={n} size="lg" />
          ))}
          <span className="font-bold text-gray-400 mx-1">+</span>
          <LottoBall n={draw.bonus} size="lg" />
        </div>
        <p className="md:ml-auto text-sm text-gray-500">
          1등 {draw.firstPrizeWinners}명 · 1인당 {formatPrize(draw.firstPrizeAmount)}
        </p>
      </div>
      {outdated && <p className="mt-2 text-xs text-gray-500">ⓘ 최신 회차 정보가 아닐 수 있어요</p>}
    </section>
  )
}

export default LatestDrawCard
