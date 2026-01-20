import { CourseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { StudentCoursePhaseEnrollment } from './StudentCoursePhaseEnrollment'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { useState } from 'react'
import { Button } from '@tumaet/prompt-ui-components'
import { CourseDetail } from './CourseDetail'

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

  const phases = sce.coursePhases

  const failedIndex = phases.findIndex((cp) => cp.passStatus === PassStatus.FAILED)

  const currentIndex = phases.findIndex((cp) => cp.passStatus === PassStatus.NOT_ASSESSED)

  const cutoffIndex =
    failedIndex !== -1 ? failedIndex : currentIndex !== -1 ? currentIndex : phases.length - 1

  const visiblePhases = phases.slice(0, cutoffIndex + 1)
  const futurePhases = phases.slice(cutoffIndex + 1)

  const hasFailed = failedIndex !== -1
  const canShowMore = !hasFailed && futurePhases.length > 0

  return (
    <CourseDetail studentCourseEnrollment={sce}>
      {visiblePhases.map((cp, index) => (
        <StudentCoursePhaseEnrollment
          key={cp.coursePhaseId}
          cpe={cp}
          studentId={studentId}
          courseId={sce.courseId}
          current={index === currentIndex}
          showLine={index === phases.length - 1 || cp.passStatus === PassStatus.FAILED}
        />
      ))}

      {canShowMore && !showFuturePhases && (
        <Button
          variant='ghost'
          className='transform -translate-x-9 -translate-y-3 text-blue-600 text-xs'
          onClick={() => setShowFuturePhases(true)}
        >
          Show More
        </Button>
      )}

      {canShowMore &&
        showFuturePhases &&
        futurePhases.map((cp, index) => (
          <StudentCoursePhaseEnrollment
            key={cp.coursePhaseId}
            cpe={cp}
            studentId={studentId}
            courseId={sce.courseId}
            current={false}
            showLine={
              cutoffIndex + index + 1 === phases.length - 1 || cp.passStatus === PassStatus.FAILED
            }
          />
        ))}
    </CourseDetail>
  )
}
