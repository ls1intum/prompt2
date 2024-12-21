import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface RequiredLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean
}

export function RequiredLabel({ required, className, children, ...props }: RequiredLabelProps) {
  return (
    <Label className={cn('flex items-center gap-1', className)} {...props}>
      {children}
      {required && (
        <span className='text-red-500' aria-hidden='true'>
          *
        </span>
      )}
      {required && <span className='sr-only'>(required)</span>}
    </Label>
  )
}
