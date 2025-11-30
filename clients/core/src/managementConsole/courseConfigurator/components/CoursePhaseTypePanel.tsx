import { useCourseConfigurationState } from '../zustand/useCourseConfigurationStore'
import { CoursePhaseType } from '../interfaces/coursePhaseType'
import { CoursePhaseTypePanelItem } from './CoursePhaseTypePanelItem'

interface CoursePhaseTypePanelProps {
  canEdit: boolean
}

export const CoursePhaseTypePanel = ({ canEdit }: CoursePhaseTypePanelProps): JSX.Element => {
  const { coursePhaseTypes, coursePhases } = useCourseConfigurationState()

  const courseHasInitialPhase = coursePhases.some((phase) => phase.isInitialPhase)

  const coursePhaseTypesOrdered = coursePhaseTypes.sort((a, b) => {
    if (a.initialPhase && !b.initialPhase) return -1
    if (!a.initialPhase && b.initialPhase) return 1
    return 0
  })

  const isDraggable = (phase: CoursePhaseType) => {
    if (!canEdit) return false
    if (phase.initialPhase && courseHasInitialPhase) return false
    if (!courseHasInitialPhase && !phase.initialPhase) return false
    return true
  }

  return (
    <div className='p-4 border-b bg-background'>
      <div className='flex justify-between'>
        <h2 className='text-lg font-semibold mb-3'>Course Phases</h2>
        <p className='text-xs text-muted-foreground'>Drag a phase onto the canvas to add it</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
        {coursePhaseTypesOrdered.map((phase) => (
          <CoursePhaseTypePanelItem key={phase.id} phase={phase} isDraggable={isDraggable(phase)} />
        ))}
      </div>
    </div>
  )
}
