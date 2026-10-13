// 페이지 번호 버튼. 서버 page는 0부터, 화면에는 1부터 보여준다.
// page: 서버 기준 현재 페이지(0~) / totalPages / onChange(serverPage)
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  // 현재 페이지 주변으로 최대 5개만 보여준다
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)

  const btn = 'h-8 min-w-8 px-2.5 text-sm transition-colors'

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-1">
      <button onClick={() => onChange(0)} disabled={page === 0} className={`${btn} text-muted hover:bg-subtle disabled:opacity-30`} aria-label="첫 페이지">
        «
      </button>
      <button onClick={() => onChange(page - 1)} disabled={page === 0} className={`${btn} text-muted hover:bg-subtle disabled:opacity-30`} aria-label="이전 페이지">
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'bg-primary font-medium text-on-primary' : 'text-muted hover:bg-subtle'}`}
        >
          {p + 1}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className={`${btn} text-muted hover:bg-subtle disabled:opacity-30`} aria-label="다음 페이지">
        ›
      </button>
      <button onClick={() => onChange(totalPages - 1)} disabled={page >= totalPages - 1} className={`${btn} text-muted hover:bg-subtle disabled:opacity-30`} aria-label="마지막 페이지">
        »
      </button>
    </nav>
  )
}
