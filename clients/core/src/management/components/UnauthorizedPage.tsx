import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useKeycloak } from '@/keycloak/useKeycloak'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const { logout } = useKeycloak()
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <div className='max-w-md w-full space-y-8'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className='text-center'>
          <Button variant='outline' onClick={logout}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
