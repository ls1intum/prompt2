import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import {
  ApplicationAnswerText,
  CreateApplicationAnswerText,
} from '@/interfaces/application_answer_text'
import {
  ApplicationAnswerMultiSelect,
  CreateApplicationAnswerMultiSelect,
} from '@/interfaces/application_answer_multi_select'
import { Student } from '@/interfaces/student'
import { useState } from 'react'
import { StudentForm } from './components/StudentForm'

interface ApplicationFormProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
  initialAnswersText?: ApplicationAnswerText[]
  initialAnswersMultiSelect?: ApplicationAnswerMultiSelect[]
  student?: Student
  onSubmit: () => void
}

export const ApplicationForm = ({
  questionsText,
  questionsMultiSelect,
  initialAnswersMultiSelect,
  initialAnswersText,
  student,
  onSubmit,
}: ApplicationFormProps): JSX.Element => {
  const [answersMultiSelect, setAnswersMultiSelect] = useState<
    (CreateApplicationAnswerMultiSelect | ApplicationAnswerMultiSelect)[]
  >(initialAnswersMultiSelect ?? [])
  const [answersText, setAnswersText] = useState<
    (CreateApplicationAnswerText | ApplicationAnswerText)[]
  >(initialAnswersText ?? [])

  const [studentData, setStudentData] = useState<Student>(student ?? ({} as Student))

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm student={studentData} onUpdate={setStudentData} />
        </CardContent>
      </Card>
    </div>
  )
}
