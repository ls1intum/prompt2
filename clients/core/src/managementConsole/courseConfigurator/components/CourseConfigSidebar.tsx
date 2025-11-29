import { useCourseConfigurationState } from '../zustand/useCourseConfigurationStore'
import { CoursePhaseType } from '../interfaces/coursePhaseType'
import { CourseConfigSidebarItem } from './CourseConfigSidebarItem'

interface CourseConfigSidebarProps {
  canEdit: boolean
}

export const CourseConfigSidebar = ({ canEdit }: CourseConfigSidebarProps): JSX.Element => {
  const { coursePhaseTypes, coursePhases } = useCourseConfigurationState()
  const courseHasInitialPhase = coursePhases.map((phase) => phase.isInitialPhase).includes(true)

  const coursePhaseTypesOrdered = coursePhaseTypes.sort((a, b) => {
    if (a.initialPhase && !b.initialPhase) {
      return -1
    }
    if (!a.initialPhase && b.initialPhase) {
      return 1
    }
    return 0
  })

  const isDraggable = (phase: CoursePhaseType) => {
    if (!canEdit) {
      return false
    }
    if (phase.initialPhase && courseHasInitialPhase) {
      return false
    }
    if (!courseHasInitialPhase && !phase.initialPhase) {
      return false
    }
    return true
  }

  return (
    <aside className='flex h-screen w-64 flex-col border-r bg-background'>
      <div className='flex h-14 items-center border-b px-4'>
        <h2 className='text-lg font-semibold'>Course Phases</h2>
      </div>
      <div className='flex-1 overflow-auto p-4'>
        <div className='space-y-2'>
          {coursePhaseTypesOrdered.map((phase) => (
            <CourseConfigSidebarItem
              phase={phase}
              key={phase.id}
              isDraggable={isDraggable(phase)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
