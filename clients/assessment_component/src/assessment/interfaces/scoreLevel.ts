export enum ScoreLevel {
  VeryBad = 'veryBad',
  Bad = 'bad',
  Ok = 'ok',
  Good = 'good',
  VeryGood = 'veryGood',
}

export function mapScoreLevelToNumber(scoreLevel: ScoreLevel): number {
  switch (scoreLevel) {
    case ScoreLevel.VeryGood:
      return 1
    case ScoreLevel.Good:
      return 2
    case ScoreLevel.Ok:
      return 3
    case ScoreLevel.Bad:
      return 4
    case ScoreLevel.VeryBad:
      return 5
    default:
      return 0 // Default case for undefined or unknown score level
  }
}

export function mapNumberToScoreLevel(number: number): ScoreLevel {
  if (number <= 1.5) return ScoreLevel.VeryGood
  if (number <= 2.5) return ScoreLevel.Good
  if (number <= 3.5) return ScoreLevel.Ok
  if (number <= 4.5) return ScoreLevel.Bad
  return ScoreLevel.VeryBad
}
