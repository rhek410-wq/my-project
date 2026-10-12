import { create } from 'zustand'
import { fillRandom, copyText } from '../service/lottoService.js'
import { GAME_COUNT, LABELS, MAX_NUM, NUM_COUNT, gameType, sortNums } from '../utils/lottoUtils.js'

const emptyResults = () => Array(GAME_COUNT).fill(null)

export const useLottoStore = create((set, get) => ({
  mode: 'pick', // 'pick'(수동) | 'exclude'(제외)
  picked: [], // 고르고 있는 수동 번호
  excluded: [], // 제외 번호
  manualGames: [], // 수동 게임 목록: [[7, 14], [1, 2, 3, 4, 5, 6]]
  results: emptyResults(), // null 또는 { type, numbers, fixed }
  message: null, // 토스트 { id, text }

  setMode: (mode) => set({ mode }),

  // 현재 모드에 따라 번호 선택/해제
  toggleNumber: (n) => {
    const { mode, picked, excluded, showMessage } = get()

    if (mode === 'pick') {
      if (picked.includes(n)) {
        set({ picked: picked.filter((x) => x !== n) })
      } else if (picked.length >= NUM_COUNT) {
        showMessage('수동 번호는 최대 6개까지 고를 수 있어요.')
      } else {
        // 제외에 있었다면 빼기
        set({ picked: [...picked, n], excluded: excluded.filter((x) => x !== n) })
      }
    } else {
      if (excluded.includes(n)) {
        set({ excluded: excluded.filter((x) => x !== n) })
      } else if (MAX_NUM - excluded.length <= NUM_COUNT) {
        showMessage('최소 6개 번호는 남겨주세요.')
      } else {
        // 수동에 있었다면 빼기
        set({ excluded: [...excluded, n], picked: picked.filter((x) => x !== n) })
      }
    }
  },

  addManualGame: () => {
    const { picked, manualGames, showMessage } = get()
    if (picked.length === 0) {
      showMessage('수동 번호를 1개 이상 골라주세요.')
      return
    }
    if (manualGames.length >= GAME_COUNT) {
      showMessage('수동 게임은 최대 5개까지 추가할 수 있어요.')
      return
    }
    set({ manualGames: [...manualGames, sortNums(picked)], picked: [] })
  },

  removeManualGame: (index) => set((s) => ({ manualGames: s.manualGames.filter((_, i) => i !== index) })),

  clearPicked: () => set({ picked: [] }),
  clearExcluded: () => set({ excluded: [] }),

  // 비어 있는 줄만 채우기
  generate: () => {
    const { results, manualGames, excluded, showMessage } = get()
    if (!results.includes(null)) {
      showMessage('비어 있는 줄이 없어요. 줄 초기화나 전체 초기화 후 생성해 주세요.')
      return
    }

    const next = results.map((r, i) => {
      if (r) return r // 이미 채워진 줄은 그대로
      const manual = manualGames[i]
      const fixed = manual ? [...manual] : []
      return {
        type: manual ? gameType(manual) : '자동',
        numbers: fillRandom(fixed, excluded),
        fixed,
      }
    })
    set({ results: next })
  },

  resetRow: (index) => set((s) => ({ results: s.results.map((r, i) => (i === index ? null : r)) })),
  resetAll: () => set({ results: emptyResults() }),

  // 한 줄 번호를 클립보드에 복사
  copyRow: async (index) => {
    const { results, showMessage } = get()
    const r = results[index]
    if (!r) {
      showMessage('비어 있는 줄은 복사할 수 없어요.')
      return
    }
    const text = r.numbers.join(', ')
    const ok = await copyText(text)
    showMessage(ok ? `${LABELS[index]}줄 번호를 복사했어요: ${text}` : '복사하지 못했어요. 번호를 직접 선택해서 복사해 주세요.')
  },

  // id를 바꿔서 같은 메시지를 연달아 띄워도 다시 보이게 함
  showMessage: (text) => set({ message: { id: Date.now(), text } }),
  hideMessage: () => set({ message: null }),
}))
