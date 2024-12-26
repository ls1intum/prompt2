import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const ErrorState = ({ error, onBack }: { error: Error; onBack: () => void }) => {
  let errorMessage = 'An error occurred while fetching the application form.'

  if (error.message.includes('404')) {
    errorMessage = 'The requested application phase cannot be found or may have already passed.'
  }
  console.error(error)

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          Error{error.message.includes('404') ? ': Not Found' : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{errorMessage}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onBack} variant='outline' className='w-full'>
          <ArrowLeft className='mr-2 h-4 w-4' /> Go Back
        </Button>
      </CardFooter>
    </Card>
  )
}
