import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts } from '../service/postService'
import { formatDate } from '../utils/format'
import { useThemeConfig } from '../stores/themeStore'

export default function BoardListPage() {
  const deco = useThemeConfig()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">📝 게시판</h1>
          <p className="mt-1 text-sm text-ink/60">모두의 이야기가 모여 있어요</p>
        </div>
        {/* 로그인하지 않았으면 로그인 화면을 거쳐 등록 화면으로 온다 */}
        <Link to="/board/new" className="btn btn-point">
          ✏️ 글쓰기
        </Link>
      </div>

      {error && <p className="alert-error">🥲 {error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="table-cute">
          <thead>
            <tr>
              <th className="w-16">번호</th>
              <th className="text-left">제목</th>
              <th className="w-28">글쓴이</th>
              <th className="w-20">추천</th>
              <th className="w-20">조회수</th>
              <th className="w-40">등록일</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink/50">{deco.loading}</td>
              </tr>
            )}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink/50">🌱 아직 게시글이 없어요. 첫 글을 남겨 주세요!</td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="text-center text-ink/50">{post.id}</td>
                <td>
                  {post.isPrivate && (
                    <span className="mr-1" title="비공개 글">
                      🔒
                    </span>
                  )}
                  <Link to={`/board/${post.id}`} className="font-bold hover:text-point">
                    {post.title}
                  </Link>
                  {post.commentCount > 0 && <span className="ml-1.5 text-xs font-bold text-point">💬{post.commentCount}</span>}
                </td>
                <td className="text-center">{post.authorName}</td>
                <td className="text-center">
                  <span className="badge bg-soft text-point-dark">👍 {post.likes}</span>
                </td>
                <td className="text-center">
                  <span className="badge bg-sun/60 text-orange-700">👀 {post.views}</span>
                </td>
                <td className="text-center text-xs text-ink/60">{formatDate(post.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
