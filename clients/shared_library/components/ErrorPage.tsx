import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, LogOut, RefreshCw } from 'lucide-react'

interface ErrorPageProps {
  title?: string
  description?: string
  message?: string
  onRetry?: () => void
  onLogout?: () => void
}

export const ErrorPage = ({
  title = 'Error',
  description = 'An error occurred',
  message = 'We apologize for the inconvenience. This could be due to a network issue or a problem with our servers. You can try to refresh or try again later.',
  onRetry,
  onLogout,
}: ErrorPageProps) => {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='container max-w-sm mx-auto p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center text-destructive'>
              <AlertCircle className='mr-2 h-5 w-5' />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>{message}</p>
            {onRetry && (
              <>
                <Button onClick={onRetry} className='w-full mb-2'>
                  <RefreshCw className='mr-2 h-4 w-4' /> Retry
                </Button>
              </>
            )}
            {onLogout && (
              <Button onClick={onLogout} variant='outline' className='w-full'>
                <LogOut className='mr-2 h-4 w-4' /> Logout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
