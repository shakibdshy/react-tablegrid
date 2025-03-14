import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div 
      className="flex items-center justify-center p-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          className
        )}
        role="presentation"
        aria-hidden="true"
      >
        <span className="sr-only">Loading data, please wait...</span>
      </div>
    </div>
  )
}
