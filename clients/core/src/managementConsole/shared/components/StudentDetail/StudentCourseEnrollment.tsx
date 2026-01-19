import { CourseAvatar } from '@core/managementConsole/layout/Sidebar/CourseSwitchSidebar/components/CourseAvatar'
import {
  CourseEnrollment,
  CoursePhaseEnrollment,
} from '@core/network/queries/getStudentEnrollments'
import { StudentCoursePhaseEnrollment } from './StudentCoursePhaseEnrollment'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { useState } from 'react'
import { Button } from '@tumaet/prompt-ui-components'

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('us-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function StudentCourseEnrollment({
  sce,
  studentId,
}: {
  sce: CourseEnrollment
  studentId: string
}) {
  const [showFuturePhases, setShowFuturePhases] = useState(false)

  const firstNotAssessedIndex = sce.coursePhases.findIndex(
    (cp) => cp.passStatus === PassStatus.NOT_ASSESSED,
  )

  const phasesUpUntilNow =
    firstNotAssessedIndex === -1
      ? sce.coursePhases
      : sce.coursePhases.slice(0, firstNotAssessedIndex + 1)

  const futurePhases =
    firstNotAssessedIndex === -1 ? [] : sce.coursePhases.slice(firstNotAssessedIndex + 1)

  const isCurrentElement = (id: string) =>
    sce.coursePhases[firstNotAssessedIndex].coursePhaseId == id

  const isLastElement = (id: string) =>
    sce.coursePhases[sce.coursePhases.length - 1].coursePhaseId == id

  return (
    <>
      <CourseAvatar
        bgColor={sce.studentReadableData['bg-color']}
        iconName={sce.studentReadableData['icon']}
      />
      <div>
        <div>
          <div className='flex items-baseline gap-1'>
            <h3 className='font-semibold text-xl leading-tight'>{sce.name}</h3>
            <span className='text-sm text-muted-foreground'>{sce.semesterTag}</span>
          </div>

          <p className='text-sm text-muted-foreground'>
            <span className='capitalize'>{sce.courseType}</span> · {sce.ects} ECTS
          </p>

          <p className='text-sm text-muted-foreground'>
            {formatDate(sce.startDate)} - {formatDate(sce.endDate)}
          </p>
        </div>
        <div className='mt-4'>
          {phasesUpUntilNow.map((cp: CoursePhaseEnrollment) => (
            <StudentCoursePhaseEnrollment
              cpe={cp}
              key={cp.coursePhaseId}
              showLine={isLastElement(cp.coursePhaseId) || cp.passStatus == PassStatus.FAILED}
              current={isCurrentElement(cp.coursePhaseId)}
              studentId={studentId}
              courseId={sce.courseId}
            />
          ))}
          {!showFuturePhases && phasesUpUntilNow.length !== sce.coursePhases.length && (
            <Button
              variant='ghost'
              className='transform -translate-x-9 -translate-y-3 text-blue-600 text-xs'
              onClick={() => setShowFuturePhases(true)}
            >
              Show More
            </Button>
          )}
          {showFuturePhases && (
            <>
              {futurePhases.map((cp: CoursePhaseEnrollment) => (
                <StudentCoursePhaseEnrollment
                  cpe={cp}
                  key={cp.coursePhaseId}
                  showLine={isLastElement(cp.coursePhaseId) || cp.passStatus == PassStatus.FAILED}
                  current={isCurrentElement(cp.coursePhaseId)}
                  studentId={studentId}
                  courseId={sce.courseId}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
