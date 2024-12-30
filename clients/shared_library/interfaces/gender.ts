export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  DIVERSE = 'diverse',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export function getGenderString(gender: Gender | undefined): string {
  switch (gender) {
    case Gender.MALE:
      return 'Male'
    case Gender.FEMALE:
      return 'Female'
    case Gender.DIVERSE:
      return 'Diverse'
    case Gender.PREFER_NOT_TO_SAY:
      return 'Prefer not to say'
    default:
      return 'Unknown'
  }
}
