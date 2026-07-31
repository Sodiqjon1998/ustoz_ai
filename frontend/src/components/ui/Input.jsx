import { cn } from '../../lib/utils'

export default function Input({ label, error, className, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      {label && (
        <span className="text-sm font-medium text-text-mute">{label}</span>
      )}
      <input
        className={cn(
          'h-12 rounded-xl border border-border px-4 text-base',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
          error && 'border-danger focus:ring-danger',
          className,
        )}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  )
}
