import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { phaseTypes } from './data' // replace this with DB request
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { Save, Pen, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MetaDataBadges } from './MetaDataBadges'

export function PhaseNode({ data }: { data: CreateCoursePhase }) {
  const [phaseData, setPhaseData] = useState(data)
  const [isEditing, setIsEditing] = useState(false)

  // type of the selected phase:
  const phaseType = phaseTypes.find((type) => type.id === phaseData.course_phase_type_id)

  const handleNameChange = (value: string) => {
    setPhaseData((prev) => ({ ...prev, name: value }))
    Object.assign(data, { ...phaseData, name: value })
  }

  return (
    <Card className='w-80 shadow-lg hover:shadow-xl transition-shadow duration-300'>
      <CardHeader className='p-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50'>
        <div className='flex flex-col'>
          {isEditing ? (
            <Input
              value={phaseData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className='w-48 mb-2'
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing((prev) => !prev)}
            />
          ) : (
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>{phaseData.name}</CardTitle>
          )}
          <Badge className='self-start bg-indigo-100 text-indigo-800'>{phaseType?.name}</Badge>
        </div>
        <Button variant='ghost' size='icon' onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? <Save className='h-4 w-4' /> : <Pen className='h-4 w-4' />}
        </Button>
      </CardHeader>
      <CardContent className='p-4 pt-2'>
        {phaseType?.input_meta_data && phaseType.input_meta_data.length > 0 && (
          <MetaDataBadges
            metaData={phaseType.input_meta_data}
            icon={<ArrowDownToLine className='w-4 h-4 text-green-500' />}
            label='Required Input Metadata'
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

      {!phaseData.is_initial_phase && (
        <Handle
          type='target'
          position={Position.Top}
          id='participants-in'
          style={{ left: 50, top: -5 }}
          className='w-10 h-3 !bg-blue-500 rounded'
        />
      )}
      {phaseType?.input_meta_data && phaseType.input_meta_data.length > 0 && (
        <Handle
          type='target'
          position={Position.Top}
          id={`metadata-in-${phaseData.name}`}
          style={{ left: 130, top: -5 }}
          className='w-3 h-3 !bg-green-500 rounded-full'
        />
      )}
      <Handle
        type='source'
        position={Position.Bottom}
        id='participants-out'
        style={{ left: 50, bottom: -5 }}
        className='w-10 h-3 !bg-blue-500 rounded'
      />
      {phaseType?.output_meta_data && phaseType.output_meta_data.length > 0 && (
        <Handle
          type='source'
          position={Position.Bottom}
          id={`metadata-out-${phaseType.name}`}
          style={{ left: 130, bottom: -5 }}
          className='w-3 h-3 !bg-green-500 rounded-full'
        />
      )}
    </Card>
  )
}
