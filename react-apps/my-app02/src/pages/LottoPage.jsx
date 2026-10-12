import Navbar from '../comp/Navbar.jsx'
import LatestDrawCard from '../comp/LatestDrawCard.jsx'
import NumberPicker from '../comp/NumberPicker.jsx'
import ManualGameList from '../comp/ManualGameList.jsx'
import ResultList from '../comp/ResultList.jsx'
import Toast from '../comp/Toast.jsx'
import { useLottoStore } from '../stores/lottoStore.js'

// 로또 번호 생성기 화면
function LottoPage() {
  const generate = useLottoStore((s) => s.generate)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <LatestDrawCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NumberPicker />

          <div>
            <ManualGameList />
            {/* ⑤ 번호 생성 */}
            <button
              type="button"
              onClick={generate}
              className="w-full mb-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold"
            >
              🔀 번호 생성
            </button>
            <ResultList />
          </div>
        </div>
      </main>

      <Toast />
    </div>
  )
}

export default LottoPage
