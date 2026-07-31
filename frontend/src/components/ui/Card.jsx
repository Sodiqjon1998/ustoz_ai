import { cn } from '../../lib/utils'

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-4 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
