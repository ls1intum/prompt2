import { ProvidedOutputDTO } from '@core/managementConsole/courseConfigurator/interfaces/providedOutputDto'
import { Handle, Position } from '@xyflow/react'

interface OutgoingDataHandleProps {
  phaseID: string
  dto: ProvidedOutputDTO
}

export const OutgoingDataHandle = ({ phaseID, dto }: OutgoingDataHandleProps): JSX.Element => {
  return (
    <div
      className={`flex items-center justify-end p-2 rounded-md bg-green-50 text-green-700 relative shadow-sm transition-all duration-200`}
    >
      <span className='mr-2 text-sm'>{dto.dtoName}</span>
      <Handle
        type='source'
        position={Position.Right}
        id={`metadata-out-phase-${phaseID}-dto-${dto.id}`}
        style={{ right: '-28px', top: '50%' }}
        className='!w-3 !h-3 !bg-green-500 rounded-full'
      />
    </div>
  )
}
