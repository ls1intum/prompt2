import { useState } from 'react'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { IntroCourseStep } from './components/IntroCourseStep'
import { useIntroCourseStore } from './zustand/useIntroCourseStore'
import { DeveloperProfilePage } from './pages/DeveloperProfile/DeveloperProfilePage'

export const IntroCoursePage = (): JSX.Element => {
  // TODO: replace with actual state management
  const { developerProfile } = useIntroCourseStore()
  const [stepsOpen, setStepsOpen] = useState([true, false, false])

  // These will be replaced by actual data fetching
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
          isCompleted={developerProfile !== undefined}
          isOpen={stepsOpen[0]}
          onToggle={() => setStepsOpen((prev) => [!prev[0], prev[1], prev[2]])}
        >
          <DeveloperProfilePage onContinue={() => setStepsOpen((prev) => [false, true, prev[2]])} />
        </IntroCourseStep>

        <IntroCourseStep
          number={2}
          title='Pre-Intro Course Infrastructure Setup'
          description='Make sure to complete this checklist before the start of the intro course.'
          isCompleted={infrastructureComplete}
          isDisabled={developerProfile === undefined}
          isOpen={stepsOpen[1]}
          onToggle={() => setStepsOpen((prev) => [prev[0], !prev[1], prev[2]])}
        >
          Here will the be infrastructure setup list.
        </IntroCourseStep>

        <IntroCourseStep
          number={3}
          title={`Seat Assignment ${seatAssignment ? '' : '(Available Soon)'}`}
          description='Below you will find the seat assignment for the intro course.'
          isCompleted={seatAssignment}
          isDisabled={!infrastructureComplete}
          isOpen={stepsOpen[2]}
          onToggle={() => setStepsOpen((prev) => [prev[0], prev[1], !prev[2]])}
        >
          Here will be the seat assignment.
        </IntroCourseStep>
      </div>
    </div>
  )
}
