export default function PostItem({ post, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs text-gray-400">#{post.id}</p>
        <h3 className="font-semibold text-gray-800">{post.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{post.body}</p>
      </div>
      <button
        onClick={() => onDelete(post.id)}
        className="shrink-0 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
      >
        삭제
      </button>
    </li>
  )
}
