export enum StudyDegree {
  BACHELOR = 'bachelor',
  MASTER = 'master',
}

export function getStudyDegreeString(degree: StudyDegree | undefined): string {
  switch (degree) {
    case StudyDegree.BACHELOR:
      return 'Bachelor'
    case StudyDegree.MASTER:
      return 'Master'
    default:
      return 'Unknown'
  }
}
