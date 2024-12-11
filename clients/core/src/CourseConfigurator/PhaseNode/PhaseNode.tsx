import { useState, useCallback } from 'react'
import { Handle, Position, useHandleConnections, useReactFlow } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { coursePhases, phaseTypes } from '../data' // replace this with DB request
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { Save, Pen, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MetaDataBadges } from './components/MetaDataBadges'

export function PhaseNode({ id, selected }: { id: string; selected?: boolean }) {
  const coursePhase = coursePhases.find((phase) => phase.id === id)
  const [phaseData, setPhaseData] = useState<CreateCoursePhase | undefined>(coursePhase)
  const [isEditing, setIsEditing] = useState(false)

  const { setNodes } = useReactFlow()

  // compute the incoming meta data
  const connections = useHandleConnections({
    type: 'target',
    id: `metadata-in-${id}`,
  })

  const incomingMetaData = connections
    .map((conn) => coursePhases.find((phase) => phase.id === conn.source)?.course_phase_type_id)
    .map((typeId) => phaseTypes.find((type) => type.id === typeId)?.output_meta_data)
    .filter((meta) => meta !== undefined)
    .flat()

  // type of the selected phase:
  const phaseType = phaseTypes.find((type) => type.id === phaseData?.course_phase_type_id)

  const handleNameChange = (value: string) => {
    setPhaseData((prev) => (prev ? { ...prev, name: value } : undefined))
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, name: value }
        }
        return node
      }),
    )
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
    <Card
      className={`w-80 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onNodeClick}
    >
      <CardHeader className='p-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50'>
        <div className='flex flex-col'>
          {isEditing ? (
            <Input
              value={phaseData?.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className='w-48 mb-2'
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing((prev) => !prev)}
            />
          ) : (
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>
              {phaseData?.name}
            </CardTitle>
          )}
          <Badge className='self-start bg-indigo-100 text-indigo-800'>{phaseType?.name}</Badge>
        </div>
        <Button variant='ghost' size='icon' onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? <Save className='h-4 w-4' /> : <Pen className='h-4 w-4' />}
        </Button>
        {/** TODO DELETE Button */}
      </CardHeader>
      <CardContent className='p-4 pt-2'>
        {phaseType?.input_meta_data && phaseType.input_meta_data.length > 0 && (
          <MetaDataBadges
            metaData={phaseType.input_meta_data}
            icon={<ArrowDownToLine className='w-4 h-4 text-green-500' />}
            label='Required Input Metadata'
            providedMetaData={incomingMetaData}
          />
        )}

        {phaseType?.output_meta_data && phaseType.output_meta_data.length > 0 && (
          <MetaDataBadges
            metaData={phaseType.output_meta_data}
            icon={<ArrowUpFromLine className='w-4 h-4 text-green-500' />}
            label='Provided Output Metadata'
          />
        )}
      </CardContent>

      {!phaseData?.is_initial_phase && (
        <Handle
          type='target'
          position={Position.Top}
          id={`participants-in-${id}`}
          style={{ left: 50, top: -5 }}
          className='w-10 h-3 !bg-blue-500 rounded'
        />
      )}
      {phaseType?.input_meta_data && phaseType.input_meta_data.length > 0 && (
        <Handle
          type='target'
          position={Position.Top}
          id={`metadata-in-${id}`}
          style={{ left: 130, top: -5 }}
          className='w-3 h-3 !bg-green-500 rounded-full'
        />
      )}
      <Handle
        type='source'
        position={Position.Bottom}
        id={`participants-out-${id}`}
        style={{ left: 50, bottom: -5 }}
        className='w-10 h-3 !bg-blue-500 rounded'
      />
      {phaseType?.output_meta_data && phaseType.output_meta_data.length > 0 && (
        <Handle
          type='source'
          position={Position.Bottom}
          id={`metadata-out-${id}`}
          style={{ left: 130, bottom: -5 }}
          className='w-3 h-3 !bg-green-500 rounded-full'
        />
      )}
    </Card>
  )
}
