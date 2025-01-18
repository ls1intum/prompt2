import { useState, useCallback } from 'react'
import { Handle, Position, useHandleConnections, useReactFlow } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pen, TriangleAlert, FileInput, FileOutput } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MetaDataBadges } from './components/MetaDataBadges'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'
import { useParams } from 'react-router-dom'
import { useCourseStore } from '@/zustand/useCourseStore'
import { useAuthStore } from '@/zustand/useAuthStore'
import { getPermissionString, Role } from '@/interfaces/permission_roles'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function PhaseNode({ id, selected }: { id: string; selected?: boolean }) {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  const canEdit = permissions.includes(
    getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semester_tag),
  )

  const { coursePhases } = useCourseConfigurationState()
  const coursePhase = coursePhases.find((phase) => phase.id === id)

  const [phaseData, setPhaseData] = useState<CoursePhasePosition | undefined>(coursePhase)
  const [isEditing, setIsEditing] = useState(false)
  const { coursePhaseTypes } = useCourseConfigurationState()

  const { setNodes } = useReactFlow()

  // compute the incoming meta data
  const connections = useHandleConnections({
    type: 'target',
    id: `metadata-in-${id}`,
  })

  const incomingMetaData = connections
    .map((conn) => coursePhases.find((phase) => phase.id === conn.source)?.course_phase_type_id)
    .map((typeId) => coursePhaseTypes.find((type) => type.id === typeId)?.provided_output_meta_data)
    .filter((meta) => meta !== undefined)
    .flat()

  // type of the selected phase:
  const phaseType = coursePhaseTypes.find((type) => type.id === phaseData?.course_phase_type_id)

  const handleNameChange = (value: string) => {
    if (coursePhase) {
      coursePhase.is_modified = true
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
        <CardHeader className='p-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-200/50 to-secondary/10 dark:from-blue-900/30 dark:to-secondary/20'>
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
        <CardContent className='p-4 pt-2'>
          {phaseType?.name === 'Application' &&
            (!phaseType?.provided_output_meta_data ||
              phaseType?.provided_output_meta_data.length === 0) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' className=''>
                      <TriangleAlert className='h-4 w-4' />
                      Requires Configuration
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right' className='max-w-xs'>
                    <p>
                      This metadata includes the assessment score, all additional scores, and
                      answers to exported questions. To configure what&apos;s exported, first save
                      the application phase, then choose the questions in the Application Question
                      Config.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {phaseType?.required_input_meta_data && phaseType.required_input_meta_data.length > 0 && (
            <MetaDataBadges
              metaData={phaseType.required_input_meta_data}
              icon={<FileInput className='w-5 h-5 text-green-500' />}
              label='Required Input Metadata'
              providedMetaData={incomingMetaData}
            />
          )}

          {phaseType?.provided_output_meta_data &&
            phaseType.provided_output_meta_data.length > 0 && (
              <MetaDataBadges
                metaData={phaseType.provided_output_meta_data}
                icon={<FileOutput className='w-5 h-5 text-green-500' />}
                label='Provided Output Metadata'
              />
            )}
        </CardContent>
      </Card>
      {!phaseData?.is_initial_phase && (
        <Handle
          type='target'
          position={Position.Top}
          id={`participants-in-${id}`}
          style={{ left: 50, top: -10 }}
          className='!w-3 !h-3 !bg-blue-500 rounded-full'
        />
      )}
      {phaseType?.required_input_meta_data && phaseType.required_input_meta_data.length > 0 && (
        <Handle
          type='target'
          position={Position.Top}
          id={`metadata-in-${id}`}
          style={{ left: 130, top: -10 }}
          className='!w-3 !h-3 !bg-green-500 rounded-full'
        />
      )}
      <Handle
        type='source'
        position={Position.Bottom}
        id={`participants-out-${id}`}
        style={{ left: 50, bottom: -10 }}
        className='!w-3 !h-3 !bg-blue-500 rounded-full'
      />
      {phaseType?.provided_output_meta_data && phaseType.provided_output_meta_data.length > 0 && (
        <Handle
          type='source'
          position={Position.Bottom}
          id={`metadata-out-${id}`}
          style={{ left: 130, bottom: -10 }}
          className='!w-3 !h-3 !bg-green-500 rounded-full'
        />
      )}
    </>
  )
}
