export const GAME_COUNT = 5 // 세트 수
export const NUM_COUNT = 6 // 세트당 번호 수
export const MAX_NUM = 45
export const LABELS = ['A', 'B', 'C', 'D', 'E']

// 오름차순 정렬한 새 배열
export const sortNums = (arr) => [...arr].sort((a, b) => a - b)

// 번호대별 공 색상 (1~10, 11~20, 21~30, 31~40, 41~45)
const BALL_COLORS = ['bg-[#fbc400]', 'bg-[#69c8f2]', 'bg-[#ff7272]', 'bg-[#aaaaaa]', 'bg-[#b0d840]']

export function ballColorClass(n) {
  return BALL_COLORS[Math.min(Math.ceil(n / 10), 5) - 1]
}

// 3006515775 → "약 30억 651만원"
export function formatPrize(amount) {
  const eok = Math.floor(amount / 100000000)
  const man = Math.floor((amount % 100000000) / 10000)
  return `약 ${eok}억 ${man}만원`
}

// 6개 = 수동, 1~5개 = 반자동
export function gameType(game) {
  return game.length === NUM_COUNT ? '수동' : '반자동'
}
