import { useLottoStore } from '../stores/lottoStore.js'
import { MAX_NUM, sortNums } from '../utils/lottoUtils.js'

const NUMBERS = Array.from({ length: MAX_NUM }, (_, i) => i + 1)

// ③ 번호 선택 (모드 전환 + 번호판)
function NumberPicker() {
  const mode = useLottoStore((s) => s.mode)
  const picked = useLottoStore((s) => s.picked)
  const excluded = useLottoStore((s) => s.excluded)
  const setMode = useLottoStore((s) => s.setMode)
  const toggleNumber = useLottoStore((s) => s.toggleNumber)
  const addManualGame = useLottoStore((s) => s.addManualGame)
  const clearPicked = useLottoStore((s) => s.clearPicked)
  const clearExcluded = useLottoStore((s) => s.clearExcluded)

  const isPick = mode === 'pick'
  const listText = (arr) => (arr.length ? sortNums(arr).join(', ') : '없음')

  // 번호 버튼 상태별 스타일
  const numberClass = (n) => {
    if (picked.includes(n)) return 'bg-blue-600 border-blue-600 text-white font-bold'
    if (excluded.includes(n)) return 'bg-red-100 border-red-300 text-red-600 line-through'
    return 'bg-white border-gray-300 hover:border-gray-500'
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-3 sm:p-4 h-full">
      <h2 className="font-bold mb-3">번호 선택</h2>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('pick')}
          className={`py-2 rounded-lg border font-semibold ${isPick ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-600 text-blue-600'}`}
        >
          ✋ 수동 번호
        </button>
        <button
          type="button"
          onClick={() => setMode('exclude')}
          className={`py-2 rounded-lg border font-semibold ${!isPick ? 'bg-red-600 border-red-600 text-white' : 'border-red-600 text-red-600'}`}
        >
          🚫 제외 번호
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        {isPick ? '번호를 눌러 수동 번호를 골라주세요 (최대 6개).' : '자동 생성에서 뺄 번호를 눌러주세요.'}
      </p>

      <div className="grid grid-cols-9 gap-1.5">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => toggleNumber(n)}
            className={`aspect-square rounded-md border text-sm ${numberClass(n)}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="text-sm my-3 space-y-0.5">
        <p>
          수동: <b>{listText(picked)}</b>
        </p>
        <p>
          제외: <b>{listText(excluded)}</b>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addManualGame} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          + 수동 게임 추가
        </button>
        <button type="button" onClick={clearPicked} className="px-3 py-1.5 text-sm rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100">
          수동 초기화
        </button>
        <button type="button" onClick={clearExcluded} className="px-3 py-1.5 text-sm rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100">
          제외 초기화
        </button>
      </div>
    </section>
  )
}

export default NumberPicker
