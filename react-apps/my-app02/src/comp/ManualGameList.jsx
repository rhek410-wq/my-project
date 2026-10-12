import GameRow from './GameRow.jsx'
import { useLottoStore } from '../stores/lottoStore.js'
import { GAME_COUNT, LABELS, gameType } from '../utils/lottoUtils.js'

// ④ 수동 게임 목록
function ManualGameList() {
  const manualGames = useLottoStore((s) => s.manualGames)
  const removeManualGame = useLottoStore((s) => s.removeManualGame)

  return (
    <section className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-3">
      <h2 className="font-bold">
        수동 게임 ({manualGames.length}/{GAME_COUNT})
      </h2>
      <p className="text-sm text-gray-500 mb-2">6개 미만으로 고르면 나머지는 자동으로 채워져요 (반자동).</p>

      {manualGames.length === 0 ? (
        <p className="text-center text-gray-500 py-4">추가된 수동 게임이 없어요 (전부 자동으로 생성)</p>
      ) : (
        <ul>
          {manualGames.map((game, i) => (
            <GameRow key={i} label={LABELS[i]} type={gameType(game)} numbers={game}>
              <button
                type="button"
                onClick={() => removeManualGame(i)}
                aria-label={`${LABELS[i]} 수동 게임 삭제`}
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-md border border-gray-400 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </GameRow>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ManualGameList
