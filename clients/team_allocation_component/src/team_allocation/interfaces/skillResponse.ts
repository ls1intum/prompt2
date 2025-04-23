export type SkillResponse = {
  skillID: string
  skillLevel: SkillLevel
}

export enum SkillLevel {
  NOVICE = 'novice',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}
