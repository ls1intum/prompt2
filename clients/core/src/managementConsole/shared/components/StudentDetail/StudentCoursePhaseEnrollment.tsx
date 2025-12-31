import { CoursePhaseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { Check, Clock, X } from 'lucide-react'
import { ReactElement } from 'react'

export function parsePostgresTimestamp(ts: string): Date {
  // Convert "YYYY-MM-DD HH:mm:ss.SSSSSS"
  // → "YYYY-MM-DDTHH:mm:ss.SSSZ"
  return new Date(ts.replace(' ', 'T') + 'Z')
}

export function formatDateTime(ts: string | null): string {
  if (!ts) return ''

  const d = parsePostgresTimestamp(ts)
  return d.toLocaleString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RoundLayout({
  children,
  className,
}: {
  children: ReactElement
  className: string
}): ReactElement {
  return (
    <div
      className={
        'w-7 h-7 overflow-hidden rounded-full flex items-center justify-center ' + className
      }
    >
      {children}
    </div>
  )
}

function ProgressIndicator({ passStatus }: { passStatus: PassStatus }): ReactElement {
  return (
    <>
      {passStatus == PassStatus.PASSED && (
        <RoundLayout className='bg-green-100 dark:bg-green-900'>
          <Check className='w-4 h-4 text-green-800 dark:text-green-300' />
        </RoundLayout>
      )}
      {passStatus == PassStatus.FAILED && (
        <RoundLayout className='bg-red-100 dark:bg-red-900'>
          <X className='w-4 h-4 text-red-800 dark:text-red-300' />
        </RoundLayout>
      )}
      {passStatus == PassStatus.NOT_ASSESSED && (
        <RoundLayout className='bg-blue-100 dark:bg-blue-900'>
          <Clock className='w-4 h-4 text-blue-800 dark:text-blue-300' />
        </RoundLayout>
      )}
    </>
  )
}

export function StudentCoursePhaseEnrollment({
  cpe,
  showLine,
}: {
  cpe: CoursePhaseEnrollment
  showLine?: boolean
}) {
  return (
    <div className='flex gap-2' key={cpe.coursePhaseId}>
      <div className='relative flex flex-col'>
        {!showLine && (
          <div className='absolute top-0 bottom-0 w-px bg-gray-300 left-1/2 -translate-x-1/2' />
        )}
        <div className='relative z-10'>
          <ProgressIndicator passStatus={cpe.passStatus} />
        </div>
      </div>
      <div className='ml-2 mb-[0.85rem]'>
        <div className='flex gap-2 items-center'>
          <div className='font-semibold text-lg'>{cpe.name}</div>
          <div>{cpe.coursePhaseType.name}</div>
        </div>
        {cpe.passStatus !== PassStatus.NOT_ASSESSED && (
          <div className='text-gray-700 text-sm'>
            {cpe.passStatus} on {formatDateTime(cpe.lastModified)}
          </div>
        )}
      </div>
    </div>
  )
}
