import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

export const getMetaDataStatus = (
  name: string,
  type: string,
  providedMetaData?: { name: string; type: string }[],
): { color: string; icon: React.ReactNode; tooltip?: string } => {
  if (!providedMetaData) return { color: 'bg-secondary', icon: null }

  const matchingItems = providedMetaData.filter((meta) => meta.name === name && meta.type === type)
  const wrongType = providedMetaData.filter((meta) => meta.name === name && meta.type !== type)

  if (name === 'applicationAnswers') {
    try {
      // Parse the item.type; if it fails, fallback to showing the raw string.
      const expectedAnswers = JSON.parse(type) as {
        key: string
        type: string
      }[]

      const providedInputAnswers = providedMetaData.find(
        (meta) => meta.name === 'applicationAnswers',
      )
      if (providedInputAnswers === undefined) {
        return {
          color: 'bg-red-200 text-red-800',
          icon: <AlertCircle className='w-3 h-3' />,
          tooltip: 'Application Answers are missing',
        }
      } else {
        const providedQuestions = JSON.parse(providedInputAnswers.type) as {
          key: string
          type: string
        }[]
        const missingQuestions = expectedAnswers.filter(
          (expected) =>
            !providedQuestions.some(
              (provided) => provided.key === expected.key && provided.type === expected.type,
            ),
        )
        if (missingQuestions.length === 0) {
          return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
        } else {
          return {
            color: 'bg-yellow-200 text-yellow-800',
            icon: <AlertTriangle className='w-3 h-3' />,
            tooltip:
              'Missing or wrong type questions: ' + missingQuestions.map((q) => q.key).join(', '),
          }
        }
      }
    } catch (error) {
      return {
        color: 'bg-red-200 text-red-800',
        icon: <AlertCircle className='w-3 h-3' />,
        tooltip: 'Cannot assess if all expected questions are provided',
      }
    }
  } else if (name === 'additionalScores') {
    try {
      // Parse the item.type; if it fails, fallback to showing the raw string.
      const expectedScores = JSON.parse(type) as string[]

      const providedScore = providedMetaData.find((meta) => meta.name === 'additionalScores')
      if (providedScore === undefined) {
        return {
          color: 'bg-red-200 text-red-800',
          icon: <AlertCircle className='w-3 h-3' />,
          tooltip: 'Additional Scores are missing',
        }
      } else {
        const providedScores = JSON.parse(providedScore.type) as string[]
        const missingScores = expectedScores.filter(
          (expected) => !providedScores.some((provided) => provided === expected),
        )
        if (missingScores.length === 0) {
          return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
        } else {
          return {
            color: 'bg-yellow-200 text-yellow-800',
            icon: <AlertTriangle className='w-3 h-3' />,
            tooltip: 'Missing or wrong type questions: ' + missingScores.join(', '),
          }
        }
      }
    } catch (error) {
      return {
        color: 'bg-red-200 text-red-800',
        icon: <AlertCircle className='w-3 h-3' />,
        tooltip: 'Cannot assess if all expected scores are provided',
      }
    }
  } else if (wrongType.length > 0) {
    return {
      color: 'bg-yellow-200 text-yellow-800',
      icon: <AlertCircle className='w-3 h-3' />,
      tooltip: 'Conflict (Wrong type): expecting type: ' + type,
    }
  }
  if (matchingItems.length === 0)
    return {
      color: 'bg-red-200 text-red-800',
      icon: <AlertCircle className='w-3 h-3' />,
      tooltip: 'Missing meta data with name: ' + name + ' and type: ' + type,
    }
  if (matchingItems.length === 1)
    return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
  return {
    color: 'bg-yellow-200 text-yellow-800',
    icon: <AlertTriangle className='w-3 h-3' />,
    tooltip: 'Conflict: metadata provided multiple times',
  }
}
