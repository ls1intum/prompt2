import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMatchingStore } from '../../zustand/useMatchingStore'
import { PreviewStep } from './components/PreviewStep'
import { MatchingStep } from './components/MatchingStep'

export const DataExportFlow = (): JSX.Element => {
  const navigate = useNavigate()
  const { uploadedData } = useMatchingStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [unrankedOption, setUnrankedOption] = useState<'no-rank' | 'unacceptable'>('no-rank')

  const steps = [
    <PreviewStep
      key='preview'
      onNext={(option) => {
        setUnrankedOption(option)
        setCurrentStep(1)
      }}
    />,
    <MatchingStep key='matching' unrankedOption={unrankedOption} />,
  ]

  return (
    <div className=''>
      <div className='relative pb-4'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          size='sm'
          className='absolute top-0 left-0'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </Button>
      </div>

      {uploadedData == null ? <div>No File has been uploaded!</div> : steps[currentStep]}
    </div>
  )
}
