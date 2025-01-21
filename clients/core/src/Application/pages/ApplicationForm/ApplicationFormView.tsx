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
import { useEffect, useRef, useState } from 'react'
import { StudentForm } from './components/StudentForm/StudentForm'
import { ApplicationQuestionTextForm } from './components/TextForm/ApplicationQuestionTextForm'
import { QuestionTextFormRef } from './utils/QuestionTextFormRef'
import { QuestionMultiSelectFormRef } from './utils/QuestionMultiSelectFormRef'
import { Button } from '@/components/ui/button'
import { StudentComponentRef } from './utils/StudentComponentRef'
import { ApplicationQuestionMultiSelectForm } from './components/MultiSelectForm/ApplicationQuestionMultiSelectForm'
import { Separator } from '@/components/ui/separator'

interface ApplicationFormProps {
  questionsText: ApplicationQuestionText[]
  questionsMultiSelect: ApplicationQuestionMultiSelect[]
  initialAnswersText?: ApplicationAnswerText[]
  initialAnswersMultiSelect?: ApplicationAnswerMultiSelect[]
  student?: Student
  isInstructorView?: boolean
  allowEditUniversityData?: boolean
  onSubmit: (
    student: Student,
    answersText: CreateApplicationAnswerText[],
    answersMultiSelect: CreateApplicationAnswerMultiSelect[],
  ) => void
}

export const ApplicationFormView = ({
  questionsText,
  questionsMultiSelect,
  initialAnswersMultiSelect,
  initialAnswersText,
  student,
  isInstructorView = false,
  allowEditUniversityData = false,
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
  const [validationFailed, setValidationFailed] = useState(false)

  // correctly propagate student data changes
  useEffect(() => {
    if (student) {
      setStudentData(student)
      if (studentRef.current) {
        studentRef.current.rerender(student)
      }
    }
  }, [student])

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
      setValidationFailed(true)
      return
    } else {
      setValidationFailed(false)
    }
    // call onSubmit
    onSubmit(studentData, answersText, answersMultiSelect)
  }

  return (
    <Card className={validationFailed ? 'border-red-500' : ''}>
      <CardHeader>
        <CardTitle>Application Form{isInstructorView}</CardTitle>
        {isInstructorView && (
          <div className='text-sm text-muted-foreground'>
            This form is in read-only mode because you are viewing this application as an
            instructor. Further, the input field descriptions are hidden for better readability.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={`${
            isInstructorView
              ? // On instructor view + large screen, we use grid with 2 columns
                'space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0'
              : // Otherwise, maintain the original vertical spacing
                'space-y-8'
          }`}
        >
          <div>
            <h2 className='text-lg font-semibold mb-2'>Personal Information</h2>
            {!isInstructorView && (
              <p className='text-sm text-muted-foreground mb-4'>
                This information will be applied for all applications at this chair.
              </p>
            )}
            <StudentForm
              student={studentData}
              onUpdate={setStudentData}
              ref={studentRef}
              isInstructorView={isInstructorView}
              allowEditUniversityData={allowEditUniversityData}
            />
          </div>
          {!isInstructorView && <Separator />}

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
                    isInstructorView={isInstructorView}
                  />
                ) : (
                  <ApplicationQuestionTextForm
                    question={question}
                    initialAnswer={
                      initialAnswersText?.find((a) => a.application_question_id === question.id)
                        ?.answer ?? ''
                    }
                    ref={(el) => (questionTextRefs.current[index] = el)}
                    isInstructorView={isInstructorView}
                  />
                )}
              </div>
            ))}
          </div>

          {!isInstructorView && (
            <div className='flex justify-end'>
              <Button onClick={handleSubmit} disabled={isInstructorView}>
                Submit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
