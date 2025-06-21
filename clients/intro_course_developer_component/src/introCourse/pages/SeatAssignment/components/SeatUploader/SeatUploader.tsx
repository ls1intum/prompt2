import { useState, useRef, useCallback, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { JSX } from 'react/jsx-runtime'
import type { Seat } from '../../../../interfaces/Seat'
import { createSeatPlan } from '../../../../network/mutations/createSeatPlan'
import { deleteSeatPlan } from '../../../../network/mutations/deleteSeatPlan'
import { RECHNERHALLE_SEATS } from '../../utils/rechnerHalle'
import { readCSVFile } from '../../utils/fileUpload'
import { SeatPlanDialog } from './SeatPlanDialog'
import { ResetSeatPlanDialog } from './ResetSeatPlanDialog'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@tumaet/prompt-ui-components'

interface SeatUploaderProps {
  existingSeats: Seat[]
}

export const SeatUploader = ({ existingSeats }: SeatUploaderProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('No file selected')
  const [selectionMethod, setSelectionMethod] = useState<'upload' | 'rechnerhalle'>('rechnerhalle')

  const hasSeatPlan = existingSeats.length > 0

  // Mutation to create seat plan.
  const mutation = useMutation({
    mutationFn: (seatNames: string[]) => createSeatPlan(phaseId ?? '', seatNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', phaseId] })
      setIsUploading(false)
      setError(null)
      setSelectedFileName('No file selected')
      // Clear file input value if present.
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: () => {
      setError('Failed to create seat plan. Please try again.')
      setIsUploading(false)
    },
  })

  // Mutation to delete/reset seat plan.
  const { mutate: mutateDeleteSeatPlan, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteSeatPlan(phaseId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', phaseId] })
      setError(null)
      // Reset file input and selected file name.
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFileName('No file selected')
      setIsDialogOpen(false)
    },
    onError: () => {
      setError('Failed to reset seat plan. Please try again.')
      setIsDialogOpen(false)
    },
  })

  const handleRechnerhalleSelect = useCallback(() => {
    setIsUploading(true)
    mutation.mutate(RECHNERHALLE_SEATS)
  }, [mutation])

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setSelectedFileName(file.name)
      setIsUploading(true)
      try {
        const seatNames = await readCSVFile(file)
        if (seatNames.length === 0) {
          setError('The CSV file is empty or invalid.')
          setIsUploading(false)
          return
        }
        // Check for duplicate seat names
        const uniqueCount = new Set(seatNames).size
        if (uniqueCount !== seatNames.length) {
          setError('Duplicate seat names detected. Please ensure all seat names are unique.')
          setIsUploading(false)
          return
        }
        mutation.mutate(seatNames)
      } catch (err: any) {
        setError(err.message || 'An error occurred while uploading the file.')
        setIsUploading(false)
      }
    },
    [mutation],
  )

  const confirmReset = useCallback(() => {
    mutateDeleteSeatPlan()
  }, [mutateDeleteSeatPlan])

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Step 1: Seat Plan Configuration</CardTitle>
            <CardDescription>
              {hasSeatPlan
                ? `Current seat plan has ${existingSeats.length} seats`
                : 'Set up a seat plan by selecting Rechnerhalle or uploading a custom CSV'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasSeatPlan ? (
          <div className='space-y-4'>
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between 
              gap-2 p-4 border border-green-100 rounded-md`}
            >
              <div className='flex items-center'>
                <CheckCircle2 className='h-5 w-5 text-green-500 mr-2' />
                <p className='text-sm'>
                  A seat plan with <span className='font-medium'>{existingSeats.length} seats</span>{' '}
                  is ready for student and tutor assignment.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-2'>
                <SeatPlanDialog seatPlan={existingSeats} />
                <ResetSeatPlanDialog
                  confirmReset={confirmReset}
                  isDeleting={isDeleting}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <RadioGroup
              value={selectionMethod}
              onValueChange={(value) => setSelectionMethod(value as 'upload' | 'rechnerhalle')}
              className='space-y-4'
            >
              <div className='flex items-start space-x-2'>
                <RadioGroupItem value='rechnerhalle' id='rechnerhalle' />
                <div className='grid gap-1.5'>
                  <Label htmlFor='rechnerhalle' className='font-medium'>
                    Use Rechnerhalle layout
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Use the predefined Rechnerhalle layout with {RECHNERHALLE_SEATS.length} seats.
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-2'>
                <RadioGroupItem value='upload' id='upload' />
                <div className='grid gap-1.5'>
                  <Label htmlFor='upload' className='font-medium'>
                    Upload seat list
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Upload a CSV file with seat names. Each seat should be on a new line or
                    separated by commas.
                  </p>
                </div>
              </div>
            </RadioGroup>

            <div className='pt-4'>
              {selectionMethod === 'rechnerhalle' ? (
                <Button
                  onClick={handleRechnerhalleSelect}
                  disabled={isUploading}
                  className='w-full sm:w-auto'
                >
                  {isUploading ? 'Setting up...' : 'Use Rechnerhalle Layout'}
                </Button>
              ) : (
                <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv,text/csv'
                    onChange={handleFileUpload}
                    className='hidden'
                    id='csv-upload'
                    disabled={isUploading}
                  />
                  <Button
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='w-full sm:w-auto'
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    {isUploading ? 'Uploading...' : 'Upload CSV File'}
                  </Button>
                  <p className='text-xs text-muted-foreground'>{selectedFileName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
