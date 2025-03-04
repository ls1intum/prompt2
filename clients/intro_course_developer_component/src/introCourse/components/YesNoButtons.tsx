import { Button } from '@/components/ui/button'

export const YesNoButtons = ({
  value,
  onChange,
}: {
  value?: boolean
  onChange: (value: boolean) => void
}) => (
  <div className='flex space-x-4'>
    <Button type='button' variant={value ? 'default' : 'outline'} onClick={() => onChange(true)}>
      Yes
    </Button>
    <Button
      type='button'
      variant={value === false ? 'default' : 'outline'}
      onClick={() => onChange(false)}
    >
      No
    </Button>
  </div>
)
