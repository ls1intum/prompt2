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
import { ApplicationQuestionTextForm } from './TextForm/ApplicationQuestionTextForm'
import { QuestionTextFormRef } from './utils/QuestionTextFormRef'
import { QuestionMultiSelectFormRef } from './utils/QuestionMultiSelectFormRef'
import { Button } from '@/components/ui/button'
import { StudentComponentRef } from './utils/StudentComponentRef'
import { ApplicationQuestionMultiSelectForm } from './MultiSelectForm/ApplicationQuestionMultiSelectForm'
import { Separator } from '@/components/ui/separator'

interface ApplicationFormProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
  initialAnswersText?: ApplicationAnswerText[]
  initialAnswersMultiSelect?: ApplicationAnswerMultiSelect[]
  student?: Student
  onSubmit: (
    student: Student,
    answersText: CreateApplicationAnswerText[],
    answersMultiSelect: CreateApplicationAnswerMultiSelect[],
  ) => void
}

export const ApplicationForm = ({
  questionsText,
  questionsMultiSelect,
  initialAnswersMultiSelect,
  initialAnswersText,
  student,
  onSubmit,
}: ApplicationFormProps): JSX.Element => {
  const questions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[] = [
    ...questionsText,
    ...questionsMultiSelect,
  ].sort((a, b) => a.order_num - b.order_num)

  const [studentData, setStudentData] = useState<Student>(student ?? ({} as Student))
  const studentRef = useRef<StudentComponentRef>(null)
  const questionTextRefs = useRef<Array<QuestionTextFormRef | null | undefined>>([])
  const questionMultiSelectRefs = useRef<Array<QuestionMultiSelectFormRef | null | undefined>>([])

  const handleSubmit = async () => {
    let allValid = true

    if (!studentRef.current) {
      console.log('Student ref is not set')
      return
    }
    const studentValid = await studentRef.current.validate()
    if (studentData && !studentValid) {
      allValid = false
    }

    // Loop over each child's ref, call validate()
    const answersText: CreateApplicationAnswerText[] = []
    for (const ref of questionTextRefs.current) {
      if (!ref) continue
      const isValid = await ref.validate()
      if (isValid) {
        answersText.push(ref.getValues())
      } else {
        allValid = false
      }
    }

    const answersMultiSelect: CreateApplicationAnswerMultiSelect[] = []
    for (const ref of questionMultiSelectRefs.current) {
      if (!ref) continue
      const isValid = await ref.validate()
      if (isValid) {
        answersMultiSelect.push(ref.getValues())
      } else {
        allValid = false
      }
    }

    if (!allValid) {
      console.log('Not all questions are valid')
      return
    }
    // call onSubmit
    onSubmit(studentData, answersText, answersMultiSelect)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          <div>
            <h2 className='text-lg font-semibold mb-2'>Personal Information</h2>
            <p className='text-sm text-muted-foreground mb-4'>
              This information will be applied for all applications at this chair.
            </p>
            <StudentForm student={studentData} onUpdate={setStudentData} ref={studentRef} />
          </div>
          <Separator />
          <div>
            <h2 className='text-lg font-semibold mb-4'>Course Specific Questions</h2>
            {questions.map((question, index) => (
              <div key={question.id} className='mb-6'>
                {'options' in question ? (
                  <ApplicationQuestionMultiSelectForm
                    question={question}
                    initialAnswers={
                      initialAnswersMultiSelect?.find(
                        (a) => a.application_question_id === question.id,
                      )?.answer ?? []
                    }
                    ref={(el) => (questionMultiSelectRefs.current[index] = el)}
                  />
                ) : (
                  <ApplicationQuestionTextForm
                    question={question}
                    initialAnswer={
                      initialAnswersText?.find((a) => a.application_question_id === question.id)
                        ?.answer ?? ''
                    }
                    ref={(el) => (questionTextRefs.current[index] = el)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
