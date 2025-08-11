import { Checkbox } from '@tumaet/prompt-ui-components'
import { ComponentProps } from 'react'

export const VerticallyCenteredCheckbox = (props: ComponentProps<typeof Checkbox>) => {
  return (
    <div className='flex items-center'>
      <Checkbox {...props} />
    </div>
  )
}
