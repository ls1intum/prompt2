import { useState, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pen, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCourseConfigurationState } from '../../zustand/useCourseConfigurationStore'
import { CoursePhaseWithPosition } from '../../interfaces/coursePhaseWithPosition'
import { useParams } from 'react-router-dom'
import { useCourseStore, useAuthStore } from '@tumaet/prompt-shared-state'
import { getPermissionString, Role } from '@tumaet/prompt-shared-state'

export function PhaseNode({ id, selected }: { id: string; selected?: boolean }) {
  // Retrieve course and permission data
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  const canEdit = permissions.includes(
    getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semesterTag),
  )

  // Retrieve phase and phase type data
  const { coursePhases, coursePhaseTypes } = useCourseConfigurationState()
  const coursePhase = coursePhases.find((phase) => phase.id === id)
  const [phaseData, setPhaseData] = useState<CoursePhaseWithPosition | undefined>(coursePhase)
  const [isEditing, setIsEditing] = useState(false)
  const phaseType = coursePhaseTypes.find((type) => type.id === phaseData?.coursePhaseTypeID)

  const { setNodes } = useReactFlow()
  const onNodeClick = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        node.selected = node.id === id
        return node
      }),
    )
  }, [id, setNodes])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (coursePhase) {
      coursePhase.isModified = true
      coursePhase.name = e.target.value
    }
    setPhaseData((prev) => (prev ? { ...prev, name: e.target.value } : undefined))
  }

  return (
    <Card
      className={`w-80 shadow-lg hover:shadow-xl transition-shadow duration-300 relative ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onNodeClick}
    >
      {/* Card Header */}
      <CardHeader className='p-4'>
        <div className='flex justify-between items-center'>
          {isEditing ? (
            <Input
              value={phaseData?.name}
              onChange={handleNameChange}
              className='w-48'
              autoFocus
              onBlur={() => setIsEditing(false)}
              onKeyUp={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <CardTitle className='text-lg font-bold text-primary'>{phaseData?.name}</CardTitle>
          )}
          {canEdit && !isEditing && (
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              <Pen className='h-4 w-4' />
            </Button>
          )}
        </div>
        <Badge variant='secondary' className='mt-2'>
          {phaseType?.name}
        </Badge>
      </CardHeader>

      {/* Card Content */}
      <CardContent className='p-4 relative'>
        {/* 1. Participants Row (horizontal with left/right handles flush with the card) */}
        <div className='participants-row relative flex items-center justify-between bg-blue-100 p-2 rounded mb-4'>
          {!phaseType?.initialPhase && (
            <Handle
              type='target'
              position={Position.Left}
              id={`participants-in-${id}`}
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
                left: '-32px', // flush with the left edge of the card
              }}
              className='!w-3 !h-3  !bg-blue-500 rounded-full'
            />
          )}
          <div className='flex-grow flex justify-center'>
            <Users className='w-6 h-6 text-blue-500' />
          </div>
          <Handle
            type='source'
            position={Position.Right}
            id={`participants-out-${id}`}
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              right: '-32px', // flush with the right edge of the card
            }}
            className='!w-3 !h-3 !bg-blue-500 rounded-full'
          />
        </div>

        {/* 2. Meta Data Inputs (required Input DTOs) */}
        {phaseType?.requiredInputDTOs && phaseType.requiredInputDTOs.length > 0 && (
          <div className='meta-data-inputs space-y-2 mb-4'>
            {phaseType.requiredInputDTOs.map((dto) => (
              <div key={dto.id} className='flex items-center'>
                <Handle
                  type='target'
                  position={Position.Left}
                  id={`metadata-in-phase-${id}-dto-${dto.id}`}
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '-16px', // handle flush with card edge
                  }}
                  className='!w-3 !h-3 !bg-green-500 rounded-full'
                />
                <span className='ml-2 text-sm'>{dto.dtoName}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3. Meta Data Outputs (provided Output DTOs) */}
        {phaseType?.providedOutputDTOs && phaseType.providedOutputDTOs.length > 0 && (
          <div className='meta-data-outputs space-y-2'>
            {phaseType.providedOutputDTOs.map((dto) => (
              <div key={dto.id} className='flex items-center justify-end'>
                <span className='mr-2 text-sm'>{dto.dtoName}</span>
                <Handle
                  type='source'
                  position={Position.Right}
                  id={`metadata-out-phase-${id}-dto-${dto.id}`}
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '-16px', // handle flush with card edge
                  }}
                  className='!w-3 !h-3 !bg-green-500 rounded-full'
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
