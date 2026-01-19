import { PhaseStudentDetailMapping } from '@core/managementConsole/PhaseMapping/PhaseStudentDetailMapping'
import { CoursePhaseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { Suspense } from 'react'
import { ProgressIndicator } from './PhaseProgressIndicator'

export function parsePostgresTimestamp(ts: string): Date {
  return new Date(ts.replace(' ', 'T') + 'Z')
}

export function formatDateTime(ts: string | null): string {
  if (!ts) return ''

  const d = parsePostgresTimestamp(ts)
  return d.toLocaleString('us-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StudentCoursePhaseEnrollment({
  cpe,
  showLine,
  current,
  studentId,
  courseId,
}: {
  cpe: CoursePhaseEnrollment
  showLine?: boolean
  current: boolean
  studentId: string
  courseId: string
}) {
  const PhaseDetail = PhaseStudentDetailMapping[cpe.coursePhaseType.name]
  return (
    <div className='flex gap-2' key={cpe.coursePhaseId}>
      <div className='relative flex flex-col'>
        {!showLine && (
          <div className='absolute top-0 bottom-0 w-px bg-gray-300 left-1/2 -translate-x-1/2' />
        )}
        <div className='relative z-10'>
          <ProgressIndicator passStatus={current ? 'CURRENT' : cpe.passStatus} />
        </div>
      </div>
      <div className='ml-2 mb-[0.85rem] group'>
        <div className='flex gap-1 items-baseline'>
          <div className='font-semibold text-lg'>{cpe.name}</div>
          <div className='text-sm text-muted-foreground'>{cpe.coursePhaseType.name}</div>
          <div className='ml-4 opacity-0 group-hover:opacity-100 transition-opacity'>
            {cpe.passStatus !== PassStatus.NOT_ASSESSED && (
              <div className='text-sm text-muted-foreground'>
                <span className='font-semibold'>{cpe.passStatus}</span> on{' '}
                {formatDateTime(cpe.lastModified)}
              </div>
            )}
          </div>
        </div>
        {PhaseDetail && (
          <div className='inline-block w-fit max-w-full py-2 px-3 border rounded-md empty:hidden'>
            <Suspense fallback={null}>
              <PhaseDetail
                studentId={studentId}
                coursePhaseId={cpe.coursePhaseId}
                courseId={courseId}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
