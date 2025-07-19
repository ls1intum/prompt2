import { CompetencyScore } from '../../interfaces/competencyScore'
import { CategoryWithCompetencies } from '../../interfaces/category'
import { mapScoreLevelToNumber } from '../../interfaces/scoreLevel'

export function getWeightedScoreLevel(
  competencyScores: CompetencyScore[],
  categories: CategoryWithCompetencies[],
): number {
  const totalCategoryWeights = categories.reduce((total, category) => total + category.weight, 0)

  const weightedCategoryScores = categories.map((category) => {
    const totalCompetencyWeights = category.competencies.reduce(
      (total, competency) => total + competency.weight,
      0,
    )

    const weightedCompetencyScores = category.competencies.map((competency) => {
      const scores = competencyScores
        .filter((score) => score.competencyID === competency.id)
        .map((score) => mapScoreLevelToNumber(score.scoreLevel) * competency.weight)
      return scores.reduce((total, score) => total + score, 0) / totalCompetencyWeights
    })

    return weightedCompetencyScores.reduce((total, score) => total + score, 0)
  })

  return weightedCategoryScores.reduce((total, score) => total + score, 0) / totalCategoryWeights
}
