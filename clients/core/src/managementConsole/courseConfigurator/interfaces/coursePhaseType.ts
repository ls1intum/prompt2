import { ProvidedOutputDTO } from './providedOutputDto'
import { RequiredInputDTO } from './requiredInputDto'

export interface CoursePhaseType {
  id: string
  name: string
  requiredInputDTOs: RequiredInputDTO[]
  providedOutputDTOs: ProvidedOutputDTO[]
  initialPhase: boolean
}
