import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'

interface AddQuestionMenuProps {
  setApplicationQuestions: React.Dispatch<
    React.SetStateAction<(ApplicationQuestionText | ApplicationQuestionMultiSelect)[]>
  >
  applicationQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[]
}

export const AddQuestionMenu = ({
  setApplicationQuestions,
  applicationQuestions,
}: AddQuestionMenuProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const handleAddNewQuestionText = () => {
    const newQuestion: ApplicationQuestionText = {
      id: `not-valid-id-question-${applicationQuestions.length + 1}`,
      title: ``,
      course_phase_id: phaseId!,
      is_required: false,
      order_num: applicationQuestions.length + 1,
      allowed_length: 500,
    }
    setApplicationQuestions([...applicationQuestions, newQuestion])
  }

  const handleAddNewQuestionMultiSelect = () => {
    const newQuestion: ApplicationQuestionMultiSelect = {
      id: `not-valid-id-question-${applicationQuestions.length + 1}`,
      title: ``,
      course_phase_id: phaseId!,
      is_required: false,
      order_num: applicationQuestions.length + 1,
      min_select: 0,
      max_select: 0,
      options: [],
    }
    setApplicationQuestions([...applicationQuestions, newQuestion])
  }

  const handleAddNewCheckbox = () => {
    const newQuestion: ApplicationQuestionMultiSelect = {
      id: `not-valid-id-question-${applicationQuestions.length + 1}`,
      title: ``,
      course_phase_id: phaseId!,
      is_required: false,
      order_num: applicationQuestions.length + 1,
      placeholder: 'CheckBoxQuestion',
      min_select: 0,
      max_select: 1,
      options: ['Yes'],
    }
    setApplicationQuestions([...applicationQuestions, newQuestion])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Add Question
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onSelect={() => handleAddNewQuestionText()}>
          Text Question
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAddNewQuestionMultiSelect()}>
          Multi-Select Question
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAddNewCheckbox()}>Checkbox</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
