import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const DataImportFlow = (): JSX.Element => {
  const navigate = useNavigate()
  return (
    <div className=''>
      <div className='relative pb-4'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          size='sm'
          className='absolute top-0 left-0'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </Button>
      </div>
    </div>
  )
}
