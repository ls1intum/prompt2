import { ReactNode } from 'react'

interface ApplicationDetailContentProps {
  applicationAnswers: ReactNode
  assessment: ReactNode
}

interface SideBySideViewProps extends ApplicationDetailContentProps {
  className?: string
}

function SideBySideView({
  applicationAnswers,
  assessment,
  className = '',
}: SideBySideViewProps) {
  return (
    <div className={`grid grid-cols-2 mt-4 ${className}`}>
      <div className='lg:pr-2 xl:pr-4 [&>*]:h-full'>{applicationAnswers}</div>
      <div>{assessment}</div>
    </div>
  )
}

export function ApplicationDetailPageLayout({
  applicationAnswers,
  assessment,
}: ApplicationDetailContentProps) {
  return (
    <>
      <div className='flex flex-col gap-4 lg:hidden'>
        {applicationAnswers}
        {assessment}
      </div>
      <SideBySideView
        className='hidden lg:grid'
        applicationAnswers={applicationAnswers}
        assessment={assessment}
      />
    </>
  )
}
