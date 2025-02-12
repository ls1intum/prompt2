import { useState, useCallback } from 'react'
import { Handle, Position, useHandleConnections, useReactFlow } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pen, TriangleAlert, FileInput, FileOutput } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MetaDataBadges } from './components/MetaDataBadges'
import { useCourseConfigurationState } from '../../zustand/useCourseConfigurationStore'
import { CoursePhaseWithPosition } from '../../interfaces/coursePhaseWithPosition'
import { useParams } from 'react-router-dom'
import { useCourseStore, useAuthStore } from '@tumaet/prompt-shared-state'
import { getPermissionString, Role } from '@tumaet/prompt-shared-state'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function PhaseNode({ id, selected }: { id: string; selected?: boolean }) {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  const canEdit = permissions.includes(
    getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semesterTag),
  )

  const { coursePhases } = useCourseConfigurationState()
  const coursePhase = coursePhases.find((phase) => phase.id === id)

  const [phaseData, setPhaseData] = useState<CoursePhaseWithPosition | undefined>(coursePhase)
  const [isEditing, setIsEditing] = useState(false)
  const { coursePhaseTypes } = useCourseConfigurationState()

  const { setNodes } = useReactFlow()

  // compute the incoming meta data
  const connections = useHandleConnections({
    type: 'target',
    id: `metadata-in-${id}`,
  })

  const incomingDTOs = connections
    .map((conn) => coursePhases.find((phase) => phase.id === conn.source)?.coursePhaseTypeID)
    .map((typeId) => coursePhaseTypes.find((type) => type.id === typeId)?.providedOutputDTOs)
    .flat()
    .filter((dto) => dto !== undefined)

  // type of the selected phase:
  const phaseType = coursePhaseTypes.find((type) => type.id === phaseData?.coursePhaseTypeID)

  const handleNameChange = (value: string) => {
    if (coursePhase) {
      coursePhase.isModified = true
      coursePhase.name = value
    }
    setPhaseData((prev) => (prev ? { ...prev, name: value } : undefined))
  }

  const onNodeClick = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.selected = true
        } else {
          node.selected = false
        }
        return node
      }),
    )
  }, [id, setNodes])

  return (
    <>
      <Card
        className={`w-80 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onNodeClick}
      >
        <CardHeader
          className={`p-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-200/50 
          to-secondary/10 dark:from-blue-900/30 dark:to-secondary/20`}
        >
          <div className='flex flex-col'>
            {isEditing ? (
              <Input
                value={phaseData?.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className='w-48 mb-2'
                autoFocus
                onBlur={() => setIsEditing(false)}
                onKeyUp={(e) => e.key === 'Enter' && setIsEditing(false)}
              />
            ) : (
              <CardTitle className='text-lg font-bold text-primary mb-2'>
                {phaseData?.name}
              </CardTitle>
            )}
            <Badge variant='secondary' className='self-start'>
              {phaseType?.name}
            </Badge>
          </div>
          {canEdit && !isEditing && (
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsEditing((prev) => !prev)
              }}
            >
              <Pen className='h-4 w-4' />
            </Button>
          )}
        </CardHeader>
        <CardContent className='p-4 pt-2'></CardContent>
      </Card>
      {!phaseData?.isInitialPhase && (
        <Handle
          type='target'
          position={Position.Top}
          id={`participants-in-${id}`}
          style={{ left: 50, top: -10 }}
          className='!w-3 !h-3 !bg-blue-500 rounded-full'
        />
      )}
      {phaseType?.requiredInputDTOs &&
        phaseType.requiredInputDTOs.length > 0 &&
        phaseType.providedOutputDTOs.map((dto, index) => {
          return (
            <Handle
              key={index}
              type='target'
              position={Position.Top}
              id={`metadata-in-phase-${id}-dto-${dto.id}`}
              style={{ left: 130 + index * 10, top: -10 }}
              className='!w-3 !h-3 !bg-green-500 rounded-full'
            />
          )
        })}
      <Handle
        type='source'
        position={Position.Bottom}
        id={`participants-out-${id}`}
        style={{ left: 50, bottom: -10 }}
        className='!w-3 !h-3 !bg-blue-500 rounded-full'
      />
      {phaseType?.requiredInputDTOs &&
        phaseType.requiredInputDTOs.length > 0 &&
        phaseType.requiredInputDTOs.map((dto, index) => {
          return (
            <Handle
              key={index}
              type='source'
              position={Position.Bottom}
              id={`metadata-out-phase-${id}-dto-${dto.id}`}
              style={{ left: 130 + index * 10, bottom: -10 }}
              className='!w-3 !h-3 !bg-green-500 rounded-full'
            />
          )
        })}
    </>
  )
}
