import { Separator } from '@tumaet/prompt-ui-components'

export const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className='space-y-2'>
      <h2 className='text-xl font-semibold'>{title}</h2>
      <Separator className='my-2' />
      <div className='space-y-2'>{children}</div>
    </div>
  )
}
