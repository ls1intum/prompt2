import { Button } from '@/components/ui/button'
import { phaseTypes } from '../data' // TODO replace this with a DB request

export function Sidebar() {
  // TODO get this from the database

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/@xyflow/react', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className='w-64 bg-gray-100 p-4'>
      <h2 className='text-lg font-semibold mb-4'>Course Phases</h2>
      <div className='space-y-2'>
        {phaseTypes.map((phase) => (
          <Button
            key={phase.id}
            variant='outline'
            className='w-full justify-start'
            draggable
            onDragStart={(event) => onDragStart(event, phase.id)}
          >
            {phase.name}
          </Button>
        ))}
      </div>
    </aside>
  )
}
