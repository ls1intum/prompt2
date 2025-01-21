import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, Plus, Trash } from 'lucide-react'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { useUpdateCoursePhaseMetaData } from '../hooks/useUpdateCoursePhaseMetaData'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InterviewSlot } from '../interfaces/InterviewSlots'

export const InterviewTimesDialog = () => {
  const { coursePhase } = useCoursePhaseStore()
  const [isOpen, setIsOpen] = useState(false)
  const { participations } = useParticipationStore()
  const [interviewSlots, setInterviewSlots] = useState<InterviewSlot[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const { mutate } = useUpdateCoursePhaseMetaData()

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView(false)
  }

  useEffect(() => {
    if (coursePhase?.meta_data?.interview_slots) {
      setInterviewSlots(coursePhase.meta_data.interview_slots)
    }
  }, [coursePhase])

  const addSlot = () => {
    setInterviewSlots((prevSlots) => [
      ...prevSlots,
      {
        id: Date.now().toString(),
        startTime: prevSlots.length ? prevSlots[prevSlots.length - 1].endTime : '',
      },
    ])
    requestAnimationFrame(() => {
      scrollToBottom()
    })
  }

  const removeSlot = (id: string) => {
    setInterviewSlots(interviewSlots.filter((slot) => slot.id !== id))
  }

  const updateSlot = (id: string, field: keyof InterviewSlot, value: string) => {
    setInterviewSlots(
      interviewSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)),
    )
  }

  const saveSlots = () => {
    if (coursePhase) {
      mutate({
        id: coursePhase.id,
        meta_data: {
          interview_slots: interviewSlots,
        },
      })
    }
    setIsOpen(false)
  }

  return (
    <>
      <Button variant='outline' onClick={() => setIsOpen(true)} className='gap-2'>
        <Clock className='h-4 w-4' />
        Set Interview Times
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Manage Interview Times</DialogTitle>
            <DialogDescription>
              Set the times when the students have their booked interview.
            </DialogDescription>
          </DialogHeader>
          <Separator />

          <div className='space-y-4 overflow-hidden'>
            <ScrollArea className='h-[300px]'>
              {interviewSlots.map((slot, index) => (
                <div key={slot.id} className='flex flex-row items-center space-x-2 p-2 pr-4'>
                  <span className='font-medium w-1/12'>{index + 1}.</span>
                  <Input
                    type='time'
                    value={slot.startTime || ''}
                    onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                    placeholder='Start Time'
                    className='w-1/6'
                  />
                  <Input
                    type='time'
                    value={slot.endTime || ''}
                    onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                    placeholder='End Time'
                    className='w-1/6'
                  />
                  <Select
                    value={slot.courseParticipationId}
                    onValueChange={(value) => updateSlot(slot.id, 'courseParticipationId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select participant' />
                    </SelectTrigger>
                    <SelectContent>
                      {participations.map((participant) => (
                        <SelectItem
                          key={participant.course_participation_id}
                          value={participant.course_participation_id}
                        >
                          {participant.student.first_name} {participant.student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant='ghost' size='icon' onClick={() => removeSlot(slot.id)}>
                    <Trash className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>

          <Button onClick={addSlot} variant='outline' className='w-full pt-2'>
            <Plus className='h-4 w-4 mr-2' />
            Add Slot
          </Button>

          <DialogFooter className='sm:justify-between'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSlots}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
