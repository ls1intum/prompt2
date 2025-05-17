export enum ScoreLevel {
  Novice = 'novice',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}

export function mapScoreLevelToNumber(scoreLevel: ScoreLevel): number {
  switch (scoreLevel) {
    case ScoreLevel.Expert:
      return 1
    case ScoreLevel.Advanced:
      return 2
    case ScoreLevel.Intermediate:
      return 3
    case ScoreLevel.Novice:
      return 4
    default:
      return 0
  }
}

export function mapNumberToScoreLevel(number: number): ScoreLevel {
  if (number < 1.5) return ScoreLevel.Expert
  if (number < 2.5) return ScoreLevel.Advanced
  if (number < 3.5) return ScoreLevel.Intermediate
  return ScoreLevel.Novice
}
