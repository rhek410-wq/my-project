import { useEffect } from 'react'
import { useLottoStore } from '../stores/lottoStore.js'

// 안내 메시지 (2.5초 뒤 자동으로 사라짐)
function Toast() {
  const message = useLottoStore((s) => s.message)
  const hideMessage = useLottoStore((s) => s.hideMessage)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(hideMessage, 2500)
    return () => clearTimeout(timer)
  }, [message, hideMessage])

  if (!message) return null

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md flex items-center gap-3 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg"
    >
      <span className="flex-1">{message.text}</span>
      <button type="button" onClick={hideMessage} aria-label="닫기" className="text-gray-300 hover:text-white">
        ✕
      </button>
    </div>
  )
}

export default Toast
