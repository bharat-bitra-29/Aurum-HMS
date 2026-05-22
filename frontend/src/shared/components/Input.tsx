import { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export default function Input({ label, error, icon, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 dark:text-gold-400/80 light:text-gold-600/80 font-sans font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500 dark:text-noir-500 light:text-noir-600">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-white dark:bg-white/[0.03] border border-gold-200 dark:border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-700 dark:text-noir-100
            placeholder:text-noir-500 dark:placeholder:text-noir-600 font-sans
            focus:outline-none focus:border-gold-600 dark:focus:border-gold-500/60 focus:bg-gold-50 dark:focus:bg-white/[0.05]
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-600 dark:border-red-700/60' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-sans">{error}</p>}
    </div>
  )
}