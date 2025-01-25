import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ApplicationQuestionMultiSelect } from '../../../interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '../../../interfaces/application/applicationQuestion/applicationQuestionText'
import { Student } from '@tumaet/prompt-shared-state'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { ApplicationFormView } from '../ApplicationForm/ApplicationFormView'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ApplicationPreviewProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
}

export const ApplicationPreview = ({
  questionsText,
  questionsMultiSelect,
}: ApplicationPreviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const initialStudent: Student = {
    firstName: 'Demo',
    lastName: 'Student',
    email: 'example@application.com',
    hasUniversityAccount: true,
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={(isOpen) => setDialogOpen(isOpen)}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Eye className='mr-2 h-4 w-4' />
          Preview Application
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[900px] w-[90vw] h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Application Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <ApplicationFormView
            questionsText={questionsText}
            questionsMultiSelect={questionsMultiSelect}
            student={initialStudent}
            onSubmit={() => {}}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
