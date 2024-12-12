export interface CoursePhaseType {
  id: string
  name: string
  required_input_meta_data: MetaDataItem[]
  provided_output_meta_data: MetaDataItem[]
  initial_phase: boolean
}

export type MetaDataItem = {
  name: string
  type: string
}
