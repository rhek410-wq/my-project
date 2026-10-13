import { useState } from 'react'

export default function PostForm({ onSubmit, loading }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await onSubmit({ title, body, userId: 1 })
    setTitle('')
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="내용"
        rows={3}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '등록 중...' : '등록 (POST)'}
      </button>
    </form>
  )
}
