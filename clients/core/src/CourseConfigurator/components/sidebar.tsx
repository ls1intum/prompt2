import { GripVertical } from 'lucide-react'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'
import { CoursePhaseType } from '@/interfaces/course_phase_type'

export function Sidebar() {
  const { coursePhaseTypes, coursePhases } = useCourseConfigurationState()
  const courseHasInitialPhase = coursePhases.map((phase) => phase.is_initial_phase).includes(true)
  const coursePhaseTypesOrdered = coursePhaseTypes.sort((a, b) => {
    if (a.initial_phase && !b.initial_phase) {
      return -1
    }
    if (!a.initial_phase && b.initial_phase) {
      return 1
    }
    return 0
  })

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/@xyflow/react', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const isDraggable = (phase: CoursePhaseType) => {
    if (phase.initial_phase && courseHasInitialPhase) {
      return false
    }
    if (!courseHasInitialPhase && !phase.initial_phase) {
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
            <div
              key={phase.id}
              draggable={isDraggable(phase)}
              onDragStart={(event) => isDraggable(phase) && onDragStart(event, phase.id)}
              className={`group flex items-center rounded-md border bg-card p-2 ${
                isDraggable(phase) ? 'cursor-move hover:bg-accent' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <GripVertical className='mr-2 h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>{phase.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
