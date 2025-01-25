import { CoursePhaseTypeMetaDataItem } from '@tumaet/prompt-shared-state'
import { renderTooltipList } from './renderTooltipList'

/** Helper: Renders tooltip content based on meta-data name */
export const renderBadgeTooltipContent = (
  item: CoursePhaseTypeMetaDataItem,
  providedMetaData?: CoursePhaseTypeMetaDataItem[],
  errorTooltip?: string,
): JSX.Element => {
  // If an error tooltip message exists, use it
  if (errorTooltip) {
    return <p>{errorTooltip}</p>
  }

  if (item.name === 'applicationAnswers') {
    try {
      const questions = JSON.parse(item.type) as { key: string; type: string }[]
      const title = !providedMetaData ? 'Exported Questions' : 'Expected Questions'
      return renderTooltipList(title, questions)
    } catch (error) {
      return (
        <div>
          <span className='font-bold'>{item.name}:</span> {item.type}
        </div>
      )
    }
  }

  if (item.name === 'additionalScores') {
    try {
      // Assuming type is a JSON-stringified array of scores
      const scores = JSON.parse(item.type) as string[]
      const title = !providedMetaData ? 'Exported Scores' : 'Expected Scores'
      return renderTooltipList(title, scores)
    } catch (error) {
      return (
        <div>
          <span className='font-bold'>{item.name}:</span> {item.type}
        </div>
      )
    }
  }

  return (
    <div>
      <span className='font-bold'>{item.name}:</span> {item.type}
    </div>
  )
}
