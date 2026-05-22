import { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <div className="text-gold-600/40 mb-2">{icon}</div>}
      <h3 className="font-display text-xl text-noir-400 italic">{title}</h3>
      {description && <p className="text-sm text-noir-600 font-sans max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
