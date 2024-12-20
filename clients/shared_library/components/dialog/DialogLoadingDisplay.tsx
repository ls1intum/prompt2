import { Loader2 } from 'lucide-react'

interface DialogLoadingDisplayProps {
  customMessage?: string
}

export const DialogLoadingDisplay = ({ customMessage }: DialogLoadingDisplayProps): JSX.Element => {
  return (
    <div className='flex flex-col items-center justify-center h-48'>
      <Loader2 className='h-10 w-10 text-primary animate-spin' />
      <p className='mt-4 text-lg font-medium text-muted-foreground'>
        {customMessage ?? 'Loading...'}
      </p>
    </div>
  )
}
