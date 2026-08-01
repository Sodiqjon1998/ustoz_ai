import { cn } from '../../lib/utils'

const variants = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-bg-subtle text-text-mute',
}

export default function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
