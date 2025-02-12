import { ProvidedOutputDTO } from './providedOutputDto'
import { RequiredInputDTO } from './requiredInputDto'

// TODO: move in shared library
export interface CoursePhaseType {
  id: string
  name: string
  requiredInputDTOs: RequiredInputDTO[]
  providedOutputDTOs: ProvidedOutputDTO[]
  initialPhase: boolean
}
