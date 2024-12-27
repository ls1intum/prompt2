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
import { useRef, useState } from 'react'
import { StudentForm } from './components/StudentForm'
import { ApplicationQuestionTextForm } from './components/ApplicationQuestionTextForm'
import { QuestionTextFormRef } from './utils/QuestionTextFormRef'
import { QuestionMultiSelectFormRef } from './utils/QuestionMultiSelectRef'
import { Button } from '@/components/ui/button'

interface ApplicationFormProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
  initialAnswersText?: ApplicationAnswerText[]
  initialAnswersMultiSelect?: ApplicationAnswerMultiSelect[]
  student?: Student
  onSubmit: () => void
}

const isMultiSelectQuestion = (
  question: ApplicationQuestionMultiSelect | ApplicationQuestionText,
): boolean => {
  return 'options' in question
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

  const questions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[] = [
    ...questionsText,
    ...questionsMultiSelect,
  ].sort((a, b) => a.order_num - b.order_num)

  const [studentData, setStudentData] = useState<Student>(student ?? ({} as Student))
  const questionTextRefs = useRef<Array<QuestionTextFormRef | null | undefined>>([])
  const questionMultiSelectRefs = useRef<Array<QuestionMultiSelectFormRef | null | undefined>>([])

  const handleSubmit = async () => {
    let allValid = true

    // Loop over each child's ref, call validate()
    for (const ref of questionTextRefs.current) {
      if (!ref) continue
      const isValid = await ref.validate()
      if (!isValid) {
        allValid = false
      } else {
        console.log(ref.getValues())
      }
    }

    if (!allValid) {
      console.log('Not all questions are valid')
      return
    }
    // call onSubmit
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm student={studentData} onUpdate={setStudentData} />
          {questions.map((question, index) => {
            return (
              <div key={index}>
                {isMultiSelectQuestion(question) ? (
                  <div>MultiSelect</div>
                ) : (
                  <div>
                    <ApplicationQuestionTextForm
                      question={question}
                      ref={(el) => (questionTextRefs.current[index] = el)}
                    />
                  </div>
                )}
              </div>
            )
          })}
          <Button onClick={handleSubmit}>Submit</Button>
        </CardContent>
      </Card>
    </div>
  )
}
