import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/zustand/useAuthStore'

export function NavAvatar(): JSX.Element {
  const { user } = useAuthStore()

  const userName = user?.firstName + ' ' + user?.lastName || ' Unknown User'
  const userEmail = user?.email || 'Unknown Email'
  const initials = `${user?.firstName.charAt(0)}${user?.lastName.charAt(0)}` || '??'

  return (
    <>
      <Avatar className='h-8 w-8 rounded-lg'>
        <AvatarImage src={''} alt={userName} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-semibold'>{userName}</span>
        <span className='truncate text-xs'>{userEmail}</span>
      </div>
    </>
  )
}
