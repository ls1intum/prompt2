import { useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCourseConfigurationState } from '../../zustand/useCourseConfigurationStore'
import { Separator } from '@/components/ui/separator'
import { IncomingDataHandle } from './components/IncomingDataHandle'
import { OutgoingDataHandle } from './components/OutgoingDataHandle'
import { NameEditingHeader } from './components/NameEditingHeader'

export function PhaseNode({ id, selected }: { id: string; selected?: boolean }) {
  // Retrieve phase and phase type data
  const { coursePhases, coursePhaseTypes } = useCourseConfigurationState()
  const coursePhase = coursePhases.find((phase) => phase.id === id)
  const phaseType = coursePhaseTypes.find((type) => type.id === coursePhase?.coursePhaseTypeID)

  const { setNodes } = useReactFlow()
  const onNodeClick = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        node.selected = node.id === id
        return node
      }),
    )
  }, [id, setNodes])

  return (
    <Card
      className={`w-80 shadow-lg hover:shadow-xl transition-shadow duration-300 relative ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onNodeClick}
    >
      {/* Card Header */}
      <CardHeader className='p-4'>
        <NameEditingHeader phaseID={id} />
        <Badge variant='secondary' className='mt-2 mr-auto'>
          {phaseType?.name}
        </Badge>
      </CardHeader>

      <Separator />

      {/* Card Content */}
      <CardContent className='p-4 relative'>
        {/* 1. Participants Row */}
        <div className='participants-row relative flex items-center justify-between bg-blue-100 p-2 rounded mb-4'>
          {!phaseType?.initialPhase && (
            <Handle
              type='target'
              position={Position.Left}
              id={`participants-in-${id}`}
              style={{ left: '-28px' }}
              className='!w-3 !h-3 !bg-blue-500 rounded-full'
            />
          )}
          <div className='flex items-center justify-center w-full'>
            <Users className='w-6 h-6 text-blue-500 mr-2' />
            <span className='text-sm font-medium text-blue-500'>Participants</span>
          </div>
          <Handle
            type='source'
            position={Position.Right}
            id={`participants-out-${id}`}
            style={{ right: '-28px' }}
            className='!w-3 !h-3 !bg-blue-500 rounded-full'
          />
        </div>

        {/* 2. Meta Data Inputs (required Input DTOs) */}
        {phaseType?.requiredInputDTOs && phaseType.requiredInputDTOs.length > 0 && (
          <div className='meta-data-inputs space-y-2 mb-4 mr-16'>
            <h4 className='text-sm font-semibold mb-2'>Required Inputs:</h4>
            {phaseType.requiredInputDTOs.map((dto) => (
              <IncomingDataHandle key={dto.id} phaseID={id} dto={dto} />
            ))}
          </div>
        )}

        {/* 3. Meta Data Outputs (provided Output DTOs) */}
        {phaseType?.providedOutputDTOs && phaseType.providedOutputDTOs.length > 0 && (
          <>
            <h4 className='text-sm font-semibold mb-2'>Provided Outputs:</h4>
            <div className='meta-data-outputs space-y-2 ml-16'>
              {phaseType.providedOutputDTOs.map((dto) => (
                <OutgoingDataHandle key={dto.id} phaseID={id} dto={dto} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
