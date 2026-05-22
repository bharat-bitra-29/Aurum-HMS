import { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField?: string
  emptyMessage?: string
}

export default function Table<T extends Record<string, any>>({
  columns, data, keyField = 'id', emptyMessage = 'No records found'
}: Props<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-white/8">
            {columns.map(col => (
              <th key={col.key} className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-gold-500/70 font-medium ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-noir-500 italic font-display text-base">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row[keyField] ?? i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3.5 text-noir-200 ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
