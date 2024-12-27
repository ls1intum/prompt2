import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { ApplicationAnswerText } from '@/interfaces/application_answer_text'
import { ApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'
import { Student } from '@/interfaces/student'
import { useRef, useState } from 'react'
import { StudentForm } from './components/StudentForm'
import { ApplicationQuestionTextForm } from './TextForm/ApplicationQuestionTextForm'
import { QuestionTextFormRef } from './utils/QuestionTextFormRef'
import { QuestionMultiSelectFormRef } from './utils/QuestionMultiSelectFormRef'
import { Button } from '@/components/ui/button'
import { StudentComponentRef } from './utils/StudentComponentRef'
import { ApplicationQuestionMultiSelectForm } from './MultiSelectForm/ApplicationQuestionMultiSelectForm'

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
    if (!studentValid) {
      allValid = false
    }

    // Loop over each child's ref, call validate()
    for (const ref of questionTextRefs.current) {
      if (!ref) continue
      const isValid = await ref.validate()
      if (!isValid) {
        allValid = false
      }
    }

    for (const ref of questionMultiSelectRefs.current) {
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
    onSubmit()
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            <StudentForm student={studentData} onUpdate={setStudentData} ref={studentRef} />
            {questions.map((question, index) => {
              return (
                <div key={index}>
                  {'options' in question ? (
                    <div>
                      <ApplicationQuestionMultiSelectForm
                        question={question}
                        initialAnswers={
                          initialAnswersMultiSelect?.find(
                            (a) => a.applicationQuestionId === question.id,
                          )?.answer ?? []
                        }
                        ref={(el) => (questionMultiSelectRefs.current[index] = el)}
                      />
                    </div>
                  ) : (
                    <div>
                      <ApplicationQuestionTextForm
                        question={question}
                        initialAnswer={
                          initialAnswersText?.find((a) => a.applicationQuestionId === question.id)
                            ?.answer ?? ''
                        }
                        ref={(el) => (questionTextRefs.current[index] = el)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
            <div className='flex justify-end mt-4'>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
