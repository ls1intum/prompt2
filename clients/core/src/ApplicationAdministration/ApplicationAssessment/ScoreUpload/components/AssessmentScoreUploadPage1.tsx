import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export interface Page1Ref {
  validate: () => boolean
  getValues: () => {
    scoreName: string
    inputType: 'number' | 'percentage'
    hasThreshold: boolean
    threshold: string
  }
}

export const AssessmentScoreUploadPage1 = forwardRef<Page1Ref>(
  function AssessmentScoreUploadPage1(props, ref) {
    const [scoreName, setScoreName] = useState('')
    const [inputType, setInputType] = useState<'number' | 'percentage'>('number')
    const [hasThreshold, setHasThreshold] = useState(false)
    const [threshold, setThreshold] = useState('')
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validate = () => {
      const newErrors: { [key: string]: string } = {}

      if (!scoreName.trim()) {
        newErrors.scoreName = 'Score name is required'
      }

      if (hasThreshold) {
        if (!threshold) {
          newErrors.threshold = 'Threshold is required when enabled'
        } else {
          const thresholdValue = parseFloat(threshold)
          if (isNaN(thresholdValue)) {
            newErrors.threshold = 'Threshold must be a number'
          } else if (inputType === 'percentage' && (thresholdValue < 0 || thresholdValue > 100)) {
            newErrors.threshold = 'Percentage must be between 0 and 100'
          } else if (thresholdValue < 0) {
            newErrors.threshold = 'Threshold must be a positive number'
          }
        }
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    useImperativeHandle(ref, () => ({
      validate,
      getValues: () => ({ scoreName, inputType, hasThreshold, threshold }),
    }))

    return (
      <div className='space-y-6'>
        <div className='space-y-4'>
          <Label htmlFor='scoreName'>Name for the new score</Label>
          <Input
            id='scoreName'
            value={scoreName}
            onChange={(e) => setScoreName(e.target.value)}
            placeholder='e.g., Midterm Exam'
          />
          {errors.scoreName && <p className='text-sm text-red-500'>{errors.scoreName}</p>}
        </div>

        <div className='space-y-4'>
          <Label>Select input type</Label>
          <RadioGroup
            value={inputType}
            onValueChange={(value: 'number' | 'percentage') => setInputType(value)}
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='number' id='number' />
              <Label htmlFor='number'>Number</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='percentage' id='percentage' />
              <Label htmlFor='percentage'>Percentage</Label>
            </div>
          </RadioGroup>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Switch id='threshold' checked={hasThreshold} onCheckedChange={setHasThreshold} />
            <Label htmlFor='threshold'>Set acceptance threshold</Label>
          </div>
          {hasThreshold && (
            <div className='space-y-2'>
              <Input
                type='number'
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={inputType === 'percentage' ? 'e.g., 60' : 'e.g., 70'}
              />
              {errors.threshold && <p className='text-sm text-red-500'>{errors.threshold}</p>}
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Students with a score below this threshold will be automatically rejected.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    )
  },
)
