import { useEffect, useState } from 'react'
import { getPosts, createPost, deletePost } from '../service/postService'
import PostForm from '../comp/PostForm'
import PostItem from '../comp/PostItem'

export default function PostPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 목록 조회
  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPosts(10)
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 화면 진입 시 최초 1회 조회
  useEffect(() => {
    getPosts(10)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // 등록
  const handleCreate = async (post) => {
    setLoading(true)
    try {
      const created = await createPost(post)
      // JSONPlaceholder는 실제 저장하지 않으므로 화면 상태에만 추가
      setPosts((prev) => [{ ...created, id: Date.now() }, ...prev])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 삭제
  const handleDelete = async (id) => {
    try {
      await deletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">axios 비동기 통신 예제</h1>
        <button
          onClick={fetchPosts}
          className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-800"
        >
          새로고침 (GET)
        </button>
      </div>

      <PostForm onSubmit={handleCreate} loading={loading} />

      {error && <p className="rounded bg-red-100 p-3 text-red-700">에러: {error}</p>}
      {loading && posts.length === 0 && <p className="text-gray-500">불러오는 중...</p>}

      <ul className="space-y-2">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  )
}
