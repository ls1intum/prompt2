import { RequiredInputDTO } from '@core/managementConsole/courseConfigurator/interfaces/requiredInputDto'
import { Handle, Position, useHandleConnections } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { schemaFulfills } from './utils/compareSchema'
import { useCourseConfigurationState } from '@core/managementConsole/courseConfigurator/zustand/useCourseConfigurationStore'

interface IncomingDataHandleProps {
  phaseID: string
  dto: RequiredInputDTO
}

export const IncomingDataHandle = ({ phaseID, dto }: IncomingDataHandleProps): JSX.Element => {
  const { coursePhaseTypes } = useCourseConfigurationState()
  const [backgroundColor, setBackgroundColor] = useState('bg-grey-50')
  const incomingEdge = useHandleConnections({
    type: 'target',
    id: `metadata-in-phase-${phaseID}-dto-${dto.id}`,
  })

  console.log(coursePhaseTypes)

  const incomingDTOs = incomingEdge
    .map((edge) => {
      if (edge?.sourceHandle && edge?.sourceHandle.split('dto-').length === 2) {
        const dtoID = edge?.sourceHandle.split('dto-')[1]
        console.log(dtoID)
        return dtoID
      } else {
        return null
      }
    })
    .map((dtoID) =>
      coursePhaseTypes
        .map((phase) => phase.providedOutputDTOs)
        .flat()
        .filter((reqDTO) => reqDTO !== null)
        .find((reqDTO) => reqDTO.id === dtoID),
    )
    .filter((reqDTO) => reqDTO !== null && reqDTO !== undefined) as RequiredInputDTO[]

  useEffect(() => {
    if (incomingDTOs.length > 1) {
      console.log('ERROR: Multiple incoming connections to a DTO')
      setBackgroundColor('bg-red-50')
      // we only allow for one incoming DTO
    } else if (incomingDTOs.length === 1) {
      // compare the incoming connection to the required DTO
      const incomingDTO = incomingDTOs[0]
      const matches = schemaFulfills(incomingDTO.specification, dto.specification)
      if (matches) {
        setBackgroundColor('bg-green-50')
      } else {
        setBackgroundColor('bg-red-50')
      }
    } else {
      setBackgroundColor('bg-red-50')
    }
  }, [dto.specification, incomingDTOs])

  return (
    <div key={dto.id} className={`flex items-center p-2 rounded relative ${backgroundColor}`}>
      <Handle
        type='target'
        position={Position.Left}
        id={`metadata-in-phase-${phaseID}-dto-${dto.id}`}
        style={{ left: '-28px', top: '50%' }}
        className='!w-3 !h-3 !bg-green-500 rounded-full'
      />
      <span className='ml-2 text-sm'>{dto.dtoName}</span>
    </div>
  )
}
