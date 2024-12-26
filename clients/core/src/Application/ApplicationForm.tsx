import { Card, CardTitle } from '@/components/ui/card'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

interface ApplicationFormProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
  onSubmit: () => void
}

export const ApplicationForm = ({
  questionsText,
  questionsMultiSelect,
  onSubmit,
}: ApplicationFormProps): JSX.Element => {
  return (
    <div>
      <Card>
        <CardTitle>Application Form</CardTitle>
      </Card>
    </div>
  )
}
