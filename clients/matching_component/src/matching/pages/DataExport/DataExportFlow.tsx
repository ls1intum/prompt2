import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMatchingStore } from '../../zustand/useMatchingStore'
import { Step1PreviewData, Step1PreviewDataRef } from './components/Step1PreviewData'
import { Step2MatchingData } from './components/Step2MatchingData'

export const DataExportFlow = (): JSX.Element => {
  const navigate = useNavigate()
  const { uploadedData } = useMatchingStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [unrankedOption, setUnrankedOption] = useState<'no-rank' | 'unacceptable'>('no-rank')

  const step1PreviewDataRef = useRef<Step1PreviewDataRef>(null)

  const steps = [
    <Step1PreviewData key='preview' ref={step1PreviewDataRef} />,
    <Step2MatchingData key='matching' unrankedOption={unrankedOption} />,
  ]

  const handleNext = () => {
    if (currentStep === 0) {
      const { selectedOption } = step1PreviewDataRef.current!.getValues()
      setUnrankedOption(selectedOption)
    } else {
      navigate(-1)
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  if (uploadedData?.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-4rem)]'>
        <p className='text-2xl font-semibold'>No data uploaded</p>
        <Button onClick={() => navigate(-1)} className='mt-4'>
          <ChevronLeft />
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className=''>
      <div className='mb-4'>{steps[currentStep]}</div>
      <div className='flex justify-between mt-8'>
        {currentStep === 0 ? (
          <Button onClick={() => navigate(-1)} className='flex items-center space-x-2'>
            <X />
            Cancel
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className='flex items-center space-x-2'
          >
            <ChevronLeft />
            Back
          </Button>
        )}

        <Button onClick={handleNext}>
          {currentStep === 0 ? <ChevronRight /> : <Check />}
          {currentStep === 0 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  )
}
