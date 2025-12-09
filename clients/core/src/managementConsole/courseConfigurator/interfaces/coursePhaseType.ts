import { ProvidedOutputDTO } from './providedOutputDto'
import { RequiredInputDTO } from './requiredInputDto'

export interface CoursePhaseType {
  id: string
  name: string
  description?: string
  requiredParticipationInputDTOs: RequiredInputDTO[]
  providedParticipationOutputDTOs: ProvidedOutputDTO[]
  requiredPhaseInputDTOs: RequiredInputDTO[]
  providedPhaseOutputDTOs: ProvidedOutputDTO[]
  initialPhase: boolean
}
