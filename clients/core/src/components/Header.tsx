import { Button } from '@/components/ui/button'
import { LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  withLoginButton?: boolean
  userName?: string
  onLogout?: () => void
}

export const Header = ({
  withLoginButton = true,
  userName,
  onLogout,
}: HeaderProps): JSX.Element => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col sm:flex-row justify-between items-center mb-12 gap-4'>
      <div className='flex items-center space-x-4'>
        <img src='/ase.jpeg' alt='TUM Logo' className='h-12 w-12' />
        <h1 className='text-xl'>Applied Education Technologies</h1>
      </div>
      {withLoginButton && !userName && (
        <Button
          variant='outline'
          className='flex items-center space-x-2'
          onClick={() => navigate('/management')}
        >
          <LogIn className='h-4 w-4' />
          <span>Chair Member Login</span>
        </Button>
      )}
      {userName && (
        <div className='flex items-center space-x-4'>
          <span className='text-sm text-muted-foreground'>Logged in as: {userName}</span>
          <Button variant='outline' className='flex items-center space-x-2' onClick={onLogout}>
            <LogOut className='h-4 w-4' />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  )
}
