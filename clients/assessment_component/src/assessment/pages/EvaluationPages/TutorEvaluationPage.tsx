import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useCourseStore } from '@tumaet/prompt-shared-state'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { AssessmentType } from '../../interfaces/assessmentType'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useTutorEvaluationCategoryStore } from '../../zustand/useTutorEvaluationCategoryStore'
import { useEvaluationStore } from '../../zustand/useEvaluationStore'
import { useTeamStore } from '../../zustand/useTeamStore'
import { useStudentEvaluationStore } from '../../zustand/useStudentEvaluationStore'

import { CategoryEvaluation } from './components/CategoryEvaluation'
import { EvaluationCompletionPage } from './components/EvaluationCompletionPage/EvaluationCompletionPage'

export const TutorEvaluationPage = () => {
  const { courseId, courseParticipationID } = useParams<{
    courseId: string
    courseParticipationID: string
  }>()
  const { isStudentOfCourse } = useCourseStore()
  const isStudent = isStudentOfCourse(courseId ?? '')

  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { myParticipation } = useMyParticipationStore()
  const { tutorEvaluationCategories } = useTutorEvaluationCategoryStore()
  const { tutorEvaluations: evaluations, tutorEvaluationCompletions: tutorEvaluationCompletions } =
    useEvaluationStore()
  const completion = tutorEvaluationCompletions.find(
    (c) => c.courseParticipationID === courseParticipationID,
  )

  const { teams } = useTeamStore()
  const { setStudentName } = useStudentEvaluationStore()

  const studentName = teams
    .flatMap((team) => team.members)
    .find((participant) => participant.id === courseParticipationID)?.firstName

  useEffect(() => {
    if (studentName) {
      setStudentName(studentName)
    }
  }, [studentName, setStudentName])

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Tutor Evaluation for {studentName}</ManagementPageHeader>

      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Please fill out the Tutor evaluation below to assess the performance and contributions of
        your team members.
      </p>

      {tutorEvaluationCategories.map((category) => (
        <CategoryEvaluation
          key={category.id}
          type={AssessmentType.TUTOR}
          courseParticipationID={courseParticipationID ?? ''}
          category={category}
          evaluations={evaluations.filter(
            (evaluation) => evaluation.courseParticipationID === courseParticipationID,
          )}
          completed={(completion?.completed ?? false) || !isStudent}
        />
      ))}

      <EvaluationCompletionPage
        type={AssessmentType.TUTOR}
        deadline={coursePhaseConfig?.tutorEvaluationDeadline ?? new Date()}
        courseParticipationID={courseParticipationID ?? ''}
        authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
        completed={(completion?.completed ?? false) || !isStudent}
        completedAt={completion?.completedAt ? new Date(completion.completedAt) : undefined}
      />
    </div>
  )
}
