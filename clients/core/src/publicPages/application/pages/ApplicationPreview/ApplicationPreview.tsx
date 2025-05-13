import { useState } from 'react'
import { Eye } from 'lucide-react'
import { ApplicationQuestionMultiSelect } from '@core/interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '@core/interfaces/application/applicationQuestion/applicationQuestionText'
import { Student } from '@tumaet/prompt-shared-state'
import { ApplicationFormView } from '../ApplicationForm/ApplicationFormView'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from '@tumaet/prompt-ui-components'

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
