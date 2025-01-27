import { forwardRef, useImperativeHandle, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useMatchingStore } from '../../../zustand/useMatchingStore'

export interface Step1PreviewDataRef {
  getValues: () => {
    selectedOption: 'no-rank' | 'unacceptable'
  }
  reset: () => void
}

export const Step1PreviewData = forwardRef<Step1PreviewDataRef>(
  function Step1PreviewData(props, ref) {
    const { uploadedData } = useMatchingStore()
    const [selectedOption, setSelectedOption] = useState<'no-rank' | 'unacceptable'>('no-rank')

    useImperativeHandle(ref, () => ({
      getValues: () => ({ selectedOption }),
      reset: () => setSelectedOption('no-rank'),
    }))

    return (
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Preview Data</h2>
        <div className='border rounded p-4 overflow-auto h-[300px]'>
          <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
        </div>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Unmatched Applications</h3>
          <RadioGroup
            value={selectedOption}
            onValueChange={(value: 'no-rank' | 'unacceptable') => setSelectedOption(value)}
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='no-rank' id='no-rank' />
              <Label htmlFor='no-rank'>Receive no rank</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='unacceptable' id='unacceptable' />
              <Label htmlFor='unacceptable'>Ranked as &quot;unacceptable (-)&quot;</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    )
  },
)
