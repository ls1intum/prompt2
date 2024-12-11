import { GripVertical } from 'lucide-react'
import { coursePhases, phaseTypes } from '../data' // TODO replace this with a DB request

export function Sidebar() {
  // TODO get this from the database
  // TODO maybe replace later if multiple are allowed!
  const courseHasInitialPhase = coursePhases.map((phase) => phase.is_initial_phase).includes(true)

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/@xyflow/react', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className='flex h-screen w-64 flex-col border-r bg-background'>
      <div className='flex h-14 items-center border-b px-4'>
        <h2 className='text-lg font-semibold'>Course Phases</h2>
      </div>
      <div className='flex-1 overflow-auto p-4'>
        <div className='space-y-2'>
          {phaseTypes.map((phase) =>
            courseHasInitialPhase && phase.initial_phase ? null : (
              <div
                key={phase.id}
                draggable
                onDragStart={(event) => onDragStart(event, phase.id)}
                className='group flex cursor-move items-center rounded-md border bg-card p-2 hover:bg-accent'
              >
                <GripVertical className='mr-2 h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>{phase.name}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </aside>
  )
}
