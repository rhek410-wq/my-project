import { MAX_NUM, NUM_COUNT, sortNums } from '../utils/lottoUtils.js'

// base 번호는 고정하고 나머지를 랜덤으로 채운 정렬 배열 반환
export function fillRandom(base, excluded) {
  const result = [...base]
  // 후보 = 1~45 중 제외 번호와 이미 들어간 번호를 뺀 것
  const pool = []
  for (let i = 1; i <= MAX_NUM; i++) {
    if (!excluded.includes(i) && !result.includes(i)) pool.push(i)
  }

  while (result.length < NUM_COUNT) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx])
    pool.splice(idx, 1) // 뽑은 번호는 후보에서 제거 (중복 방지)
  }
  return sortNums(result)
}

// 날짜로 최신 회차 계산 (1회 = 2002-12-07 토요일, 매주 토요일 20:45 추첨)
export function getExpectedRound(today) {
  const lastSat = new Date(today)
  lastSat.setDate(lastSat.getDate() - ((today.getDay() + 1) % 7)) // 가장 최근 토요일
  lastSat.setHours(20, 45, 0, 0)
  if (lastSat > today) {
    lastSat.setDate(lastSat.getDate() - 7) // 아직 추첨 전이면 전 주 토요일
  }

  // 서머타임 영향을 없애려고 날짜만 UTC로 비교
  const first = Date.UTC(2002, 11, 7)
  const sat = Date.UTC(lastSat.getFullYear(), lastSat.getMonth(), lastSat.getDate())
  return Math.round((sat - first) / (7 * 24 * 60 * 60 * 1000)) + 1
}

// 클립보드 복사. 성공하면 true
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 아래 방법으로 다시 시도
    }
  }

  // clipboard API를 못 쓸 때: 임시 textarea를 만들어 복사
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  ta.remove()
  return ok
}
