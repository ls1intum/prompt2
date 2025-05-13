import { useState } from 'react'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { IntroCourseStep } from './components/IntroCourseStep'
import { useIntroCourseStore } from './zustand/useIntroCourseStore'
import { DeveloperProfilePage } from './pages/DeveloperProfile/DeveloperProfilePage'
import { StudentSeatAssignmentDisplay } from './pages/StudentSeatAssignmentDisplay/StudentSeatAssignmentDisplay'

export const IntroCoursePage = (): JSX.Element => {
  // TODO: replace with actual state management
  const { developerProfile, seatAssignment } = useIntroCourseStore()
  const [stepsOpen, setStepsOpen] = useState(() => {
    if (developerProfile === undefined) return [true, false]
    if (developerProfile !== undefined && seatAssignment !== undefined) return [false, true]
    return [false, false]
  })

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
          isCompleted={developerProfile !== undefined}
          isOpen={stepsOpen[0]}
          onToggle={() => setStepsOpen((prev) => [!prev[0], prev[1], prev[2]])}
        >
          <DeveloperProfilePage onContinue={() => setStepsOpen((prev) => [false, prev[1]])} />
        </IntroCourseStep>

        <IntroCourseStep
          number={2}
          title={`Seat Assignment ${seatAssignment ? '' : '(Available Soon)'}`}
          description='Below you will find the seat assignment for the intro course.'
          isCompleted={false}
          isDisabled={seatAssignment === undefined}
          isOpen={stepsOpen[1]}
          onToggle={() => setStepsOpen((prev) => [prev[0], !prev[1]])}
        >
          <StudentSeatAssignmentDisplay />
        </IntroCourseStep>
      </div>
    </div>
  )
}
