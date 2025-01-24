import { ApplicationMetaData } from '../interfaces/applicationMetaData'

export function getIsApplicationConfigured(metaData: ApplicationMetaData | null): boolean {
  return metaData?.applicationStartDate &&
    metaData.applicationEndDate &&
    metaData.externalStudentsAllowed !== undefined
    ? true
    : false
}
