import GameRow from './GameRow.jsx'
import { useLottoStore } from '../stores/lottoStore.js'
import { LABELS } from '../utils/lottoUtils.js'

const iconBtn = 'w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-md border'

// ⑥ 생성 결과
function ResultList() {
  const results = useLottoStore((s) => s.results)
  const resetRow = useLottoStore((s) => s.resetRow)
  const resetAll = useLottoStore((s) => s.resetAll)
  const copyRow = useLottoStore((s) => s.copyRow)

  const allEmpty = results.every((r) => r === null)

  return (
    <section className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">생성 결과</h2>
        <button type="button" onClick={resetAll} className="px-2.5 py-1 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50">
          ↺ 전체 초기화
        </button>
      </div>

      {allEmpty ? (
        <p className="text-center text-gray-500 py-4">번호 생성 버튼을 눌러주세요</p>
      ) : (
        <ul>
          {results.map((r, i) => (
            <GameRow key={i} label={LABELS[i]} type={r ? r.type : '-'} numbers={r ? r.numbers : []} fixed={r ? r.fixed : []} highlight={!!r}>
              <button
                type="button"
                onClick={() => copyRow(i)}
                aria-label={`${LABELS[i]}줄 복사`}
                title="복사"
                className={`${iconBtn} border-gray-400 text-gray-600 hover:bg-gray-100`}
              >
                ⧉
              </button>
              <button
                type="button"
                onClick={() => resetRow(i)}
                aria-label={`${LABELS[i]}줄 초기화`}
                title="초기화"
                className={`${iconBtn} border-red-400 text-red-600 hover:bg-red-50`}
              >
                ↺
              </button>
            </GameRow>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ResultList
