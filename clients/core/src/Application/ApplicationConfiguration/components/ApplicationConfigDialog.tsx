import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApplicationMetaData } from '../interfaces/ApplicationMetaData'
import { DatePicker } from '@/components/DatePicker'
import { format } from 'date-fns'

interface ApplicationConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData: ApplicationMetaData
}

export function ApplicationConfigDialog({
  isOpen,
  onClose,
  initialData,
}: ApplicationConfigDialogProps) {
  const [startDate, setStartDate] = useState(initialData.applicationStartDate?.toISOString() || '')
  const [endDate, setEndDate] = useState(initialData.applicationEndDate?.toISOString() || '')
  const [externalStudentsAllowed, setExternalStudentsAllowed] = useState(
    initialData.externalStudentsAllowed,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call modification here
    // onSubmit({
    //   applicationStartDate: new Date(startDate),
    //   applicationEndDate: new Date(endDate),
    //   externalStudentsAllowed,
    // })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Application Phase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='startDate' className='text-right'>
                Start Date
              </Label>
              <DatePicker
                date={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='endDate' className='text-right'>
                End Date
              </Label>
              <DatePicker
                date={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='externalStudents' className='text-right'>
                External Students Allowed
              </Label>
              <Switch
                id='externalStudents'
                checked={externalStudentsAllowed}
                onCheckedChange={setExternalStudentsAllowed}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
