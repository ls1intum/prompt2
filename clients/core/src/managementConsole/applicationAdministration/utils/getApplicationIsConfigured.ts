import { ApplicationMetaData } from '../interfaces/applicationMetaData'

export function getIsApplicationConfigured(restrictedData: ApplicationMetaData | null): boolean {
  return restrictedData?.applicationStartDate &&
    restrictedData.applicationEndDate &&
    restrictedData.externalStudentsAllowed !== undefined
    ? true
    : false
}
