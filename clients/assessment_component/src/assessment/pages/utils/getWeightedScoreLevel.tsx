import { CompetencyScore } from '../../interfaces/competencyScore'
import { CategoryWithCompetencies } from '../../interfaces/category'
import { mapScoreLevelToNumber } from '../../interfaces/scoreLevel'

export function getWeightedScoreLevel(
  competencyScores: CompetencyScore[],
  categories: CategoryWithCompetencies[],
): number {
  if (!competencyScores?.length || !categories?.length) {
    return 0
  }

  const totalWeightsOfCategoriesWithScore = categories
    .filter((category) =>
      category.competencies.some((competency) =>
        competencyScores.some((score) => score.competencyID === competency.id),
      ),
    )
    .reduce((total, category) => total + category.weight, 0)

  return (
    categories
      .map((category) => {
        const totalWeightOfCompetenciesWithScore = category.competencies
          .filter((competency) =>
            competencyScores.some((score) => score.competencyID === competency.id),
          )
          .reduce((totalWeight, competency) => totalWeight + competency.weight, 0)

        const categoryAverage = category.competencies
          .map(
            (competency) =>
              competencyScores
                .filter((score) => score.competencyID === competency.id)
                .map((score) => mapScoreLevelToNumber(score.scoreLevel) * competency.weight)
                .reduce((totalWeight, score) => totalWeight + score, 0) /
              totalWeightOfCompetenciesWithScore,
          )
          .reduce((totalWeight, score) => totalWeight + score, 0)

        return categoryAverage * category.weight
      })
      .reduce((totalWeight, score) => totalWeight + score, 0) / totalWeightsOfCategoriesWithScore
  )
}
