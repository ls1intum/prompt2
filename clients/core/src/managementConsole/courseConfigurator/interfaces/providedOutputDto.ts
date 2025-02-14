export interface ProvidedOutputDTO {
  id: string
  coursePhaseTypeID: string
  dtoName: string
  specification: { [key: string]: string }
  versionNumber: number
  endpointPath: string
}
