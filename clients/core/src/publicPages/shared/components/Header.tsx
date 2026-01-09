import { Button } from '@tumaet/prompt-ui-components'
import { LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import packageJSON from '../../../../package.json'

interface HeaderProps {
  withLoginButton?: boolean
  userName?: string
  onLogout?: () => void
}

export const Header = ({
  withLoginButton = true,
  userName,
  onLogout,
}: HeaderProps) => {
  const navigate = useNavigate()
  const version = packageJSON.version
  return (
    <div className='flex flex-col sm:flex-row justify-between items-center mb-12 gap-4'>
      <div className='flex items-center space-x-4'>
        <img src='/prompt_logo.svg' alt='PROMPT Logo' className='h-12 w-12' />
        <div className='relative flex items-baseline'>
          <span className='text-2xl font-extrabold tracking-wide text-primary drop-shadow-sm'>
            PROMPT
          </span>
          <span className='ml-1 text-s font-normal text-gray-400'>{version}</span>
        </div>
      </div>
      {withLoginButton && !userName && (
        <Button
          variant='outline'
          className='flex items-center space-x-2'
          onClick={() => navigate('/management')}
        >
          <LogIn className='h-4 w-4' />
          <span>Login</span>
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
