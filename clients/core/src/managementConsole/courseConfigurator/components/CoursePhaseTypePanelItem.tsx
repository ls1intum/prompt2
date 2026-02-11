import { GripVertical } from 'lucide-react'
import { CoursePhaseType } from '../interfaces/coursePhaseType'
import { CoursePhaseTypeDescription } from './CoursePhaseTypeDescription'

interface CoursePhaseTypePanelItemProps {
  phase: CoursePhaseType
  isDraggable: boolean
}

export const CoursePhaseTypePanelItem = ({ phase, isDraggable }: CoursePhaseTypePanelItemProps) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/@xyflow/react', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      key={phase.id}
      draggable={isDraggable}
      onDragStart={(event) => isDraggable && onDragStart(event, phase.id)}
      className={`relative group flex items-center justify-between rounded-md border bg-card p-2 ${
        isDraggable ? 'cursor-move hover:bg-accent' : 'cursor-not-allowed opacity-50'
      }`}
    >
      <div className='flex items-center'>
        <GripVertical className='mr-2 h-4 w-4 text-muted-foreground' />
        <span className='text-sm font-medium'>{phase.name}</span>
      </div>
      <CoursePhaseTypeDescription title={phase.name} description={phase.description} />
    </div>
  )
}
