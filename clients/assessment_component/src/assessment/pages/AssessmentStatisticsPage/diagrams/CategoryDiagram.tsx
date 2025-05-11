import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { StatisticalBarChart } from './components/StatisticalBarChart'

import { createStatisticalDataPoint } from './utils/createStatisticalDataPoint'
import { CategoryWithCompetencies } from '../../../interfaces/category'
import { Assessment } from '../../../interfaces/assessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

interface CategoryDiagramProps {
  categories: CategoryWithCompetencies[]
  assessments: Assessment[]
}

export const CategoryDiagram = ({ categories, assessments }: CategoryDiagramProps): JSX.Element => {
  const categoryMap = new Map<string, ScoreLevel[]>()
  categories.forEach((category) => {
    const categoryAssessments = assessments
      .filter((assessment) =>
        category.competencies.map((competency) => competency.id).includes(assessment.competencyID),
      )
      .map((assessment) => assessment.score)
    if (!categoryMap.has(category.name)) {
      categoryMap.set(category.name, [])
    }
    categoryMap.get(category.name)?.push(...categoryAssessments)
  })
  const data = Array.from(categoryMap.entries()).map(([category, scores]) =>
    createStatisticalDataPoint(category, scores),
  )

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <StatisticalBarChart data={data} />
      </CardContent>
    </Card>
  )
}
