import { ReactNode, useState } from 'react'
import { DropdownMenuItem } from '@tumaet/prompt-ui-components'
import { Loader } from 'lucide-react'

interface CourseActionsMenuItemWithLoaderProps {
  icon: ReactNode
  onClick: () => Promise<void>
  name: string
  disabled?: boolean
}

export const CourseActionsMenuItemWithLoader = ({
  icon: Icon,
  onClick,
  name,
  disabled = false,
}: CourseActionsMenuItemWithLoaderProps): JSX.Element => {
  const [loading, setLoading] = useState(false)

  async function handleClick(event: any) {
    event?.preventDefault()
    if (loading || disabled) return

    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenuItem onClick={handleClick} disabled={disabled || loading}>
      {loading ? <Loader className='animate-spin' /> : Icon}
      {name}
    </DropdownMenuItem>
  )
}
