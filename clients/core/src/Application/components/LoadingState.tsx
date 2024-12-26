import { Loader2 } from 'lucide-react'

export const LoadingState = () => (
  <div className='flex flex-col items-center justify-center h-[60vh]'>
    <Loader2 className='h-16 w-16 animate-spin text-primary' />
    <p className='mt-4 text-lg text-muted-foreground'>Loading application form...</p>
  </div>
)
