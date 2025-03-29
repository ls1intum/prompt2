import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UnauthorizedPageProps {
  onLogout?: () => void
  backUrl?: string
  customMessage?: string
}

export default function UnauthorizedPage({
  onLogout,
  backUrl,
  customMessage,
}: UnauthorizedPageProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <Card className='max-w-md w-full shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center text-primary'>
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert
            variant='destructive'
            className='border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
          >
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Unauthorized</AlertTitle>
            <AlertDescription>
              {customMessage ? customMessage : 'You do not have permission to access this page.'}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className='flex justify-center space-x-4'>
          {backUrl && (
            <Button
              variant='outline'
              onClick={() => {
                navigate(backUrl)
              }}
              className='w-full sm:w-auto'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          )}
          {onLogout && (
            <Button variant='destructive' onClick={() => onLogout()} className='w-full sm:w-auto'>
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
