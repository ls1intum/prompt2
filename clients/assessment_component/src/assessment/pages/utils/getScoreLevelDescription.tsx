import { Competency } from '../../interfaces/competency'
import { ScoreLevel } from '../../interfaces/scoreLevel'

export const getScoreLevelDescription = (scoreLevel: ScoreLevel, competency: Competency) => {
  switch (scoreLevel) {
    case ScoreLevel.VeryGood:
      return competency.descriptionVeryGood
    case ScoreLevel.Good:
      return competency.descriptionGood
    case ScoreLevel.Ok:
      return competency.descriptionOk
    case ScoreLevel.Bad:
      return competency.descriptionBad
    case ScoreLevel.VeryBad:
      return competency.descriptionVeryBad
    default:
      return 'Unknown'
  }
}
