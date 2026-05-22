import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPage: (p: number) => void
}

export default function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3)            pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btn = (label: React.ReactNode, target: number, disabled: boolean) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onPage(target)}
      disabled={disabled}
      className={`
        w-8 h-8 flex items-center justify-center rounded-sm text-xs font-sans transition-all border
        ${disabled
          ? 'text-noir-700 border-transparent cursor-not-allowed'
          : target === page
            ? 'bg-gold-600/15 text-gold-300 border-gold-600/20'
            : 'text-noir-400 border-white/8 hover:text-noir-100 hover:border-white/20'
        }
      `}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {btn(<ChevronLeft size={13} />, page - 1, page === 1)}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="w-8 text-center text-xs text-noir-600">…</span>
          : btn(p, p as number, p === page)
      )}
      {btn(<ChevronRight size={13} />, page + 1, page === totalPages)}
    </div>
  )
}