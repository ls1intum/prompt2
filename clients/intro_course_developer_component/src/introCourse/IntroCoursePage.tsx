import { useState } from 'react'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { IntroCourseStep } from './components/IntroCourseStep'
import { DeveloperProfileFormPage } from './pages/DeveloperProfileFormPage'
import { DeveloperProfile } from './interfaces/DeveloperProfile'

export const IntroCoursePage = (): JSX.Element => {
  // TODO: replace with actual state management
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile | undefined>(undefined)

  const [surveyCompleted, setSurveyCompleted] = useState(false)
  const [infrastructureComplete, setInfrastructureComplete] = useState(false)
  const [seatAssignment, setSeatAssignment] = useState(false)

  return (
    <div>
      <ManagementPageHeader>Intro Course</ManagementPageHeader>
      <p className='mb-8 text-lg text-muted-foreground'>
        Welcome to the Intro Course of the iPraktikum. Please complete all required steps below.
      </p>

      <div className='space-y-6'>
        <IntroCourseStep
          number={1}
          title='Developer Profile Survey'
          description='Make sure to fill out the survey before the deadline.'
          isCompleted={surveyCompleted}
          isOpen={!surveyCompleted}
          onToggle={() => {}}
        >
          <DeveloperProfileFormPage
            developerProfile={developerProfile}
            onSubmit={(profile) => {
              console.log(profile)
            }}
          />
        </IntroCourseStep>

        <IntroCourseStep
          number={2}
          title='Pre-Intro Course Infrastructure Setup'
          description='Make sure to complete this checklist before the start of the intro course.'
          isCompleted={infrastructureComplete}
          isDisabled={!surveyCompleted}
          onToggle={() => setInfrastructureComplete(!infrastructureComplete)}
        >
          Here will the be infrastructure setup list.
        </IntroCourseStep>

        <IntroCourseStep
          number={3}
          title={`Seat Assignment ${seatAssignment ? '' : '(Available Soon)'}`}
          description='Below you will find the seat assignment for the intro course.'
          isCompleted={seatAssignment}
          isDisabled={!infrastructureComplete}
          onToggle={() => setSeatAssignment(!seatAssignment)}
        >
          Here will be the seat assignment.
        </IntroCourseStep>
      </div>
    </div>
  )
}
