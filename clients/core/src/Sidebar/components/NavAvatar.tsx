import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/zustand/useAuthStore'
import { sha256 } from 'js-sha256'

const getGravatarUrl = (email) => {
  const hash = sha256(email.trim().toLowerCase())

  return `https://www.gravatar.com/avatar/${hash}?d=identicon&d=404`
}

export function NavAvatar(): JSX.Element {
  const { user } = useAuthStore()

  const userName = user?.firstName + ' ' + user?.lastName || ' Unknown User'
  const userEmail = user?.email || 'Unknown Email'
  const initials = `${user?.firstName.charAt(0)}${user?.lastName.charAt(0)}` || '??'

  return (
    <>
      <Avatar className='h-12 w-12 rounded-lg'>
        <AvatarImage src={getGravatarUrl(userEmail)} alt={userName} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-semibold'>{userName}</span>
        <span className='truncate text-xs'>{userEmail}</span>
      </div>
    </>
  )
}
