import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-sm hover:opacity-90',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'bg-transparent text-text hover:bg-bg-subtle',
  danger: 'bg-danger text-white hover:opacity-90',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4 text-base',
  lg: 'h-14 px-6 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold font-heading',
        'transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
