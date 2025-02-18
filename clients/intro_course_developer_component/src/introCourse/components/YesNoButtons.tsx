import { Button } from '@/components/ui/button'

export const YesNoButtons = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => (
  <div className='flex space-x-4'>
    <Button
      type='button'
      variant={value === 'yes' ? 'default' : 'outline'}
      onClick={() => onChange('yes')}
    >
      Yes
    </Button>
    <Button
      type='button'
      variant={value === 'no' ? 'default' : 'outline'}
      onClick={() => onChange('no')}
    >
      No
    </Button>
  </div>
)
