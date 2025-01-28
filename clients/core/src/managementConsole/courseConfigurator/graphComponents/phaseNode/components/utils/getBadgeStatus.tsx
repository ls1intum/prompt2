import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

interface ParsedQuestion {
  key: string
  type: string
}

/**
 * Helper: Parses a JSON string safely.
 * @param jsonString The JSON string to parse.
 * @returns The parsed data or null if parsing failed.
 */
const safeParseJSON = <T,>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    return null
  }
}

/**
 * Helper: Returns an error response.
 */
const errorResponse = (tooltip: string) => ({
  color: 'bg-red-200 text-red-800',
  icon: <AlertCircle className='w-3 h-3' />,
  tooltip,
})

/**
 * Returns metadata status based on provided and expected metadata.
 */
export const getMetaDataStatus = (
  name: string,
  type: string,
  alternativeNames: string[],
  providedMetaData?: { name: string; type: string }[],
): { color: string; icon: React.ReactNode; tooltip?: string } => {
  // If no provided metadata, default fallback
  if (!providedMetaData) return { color: 'bg-secondary', icon: null }
  // Filter the provided metadata for matching or wrong types
  const matchingItems = providedMetaData.filter(
    (meta) =>
      (meta.name === name ||
        alternativeNames.find((alternativeName) => alternativeName === meta.name)) &&
      meta.type === type,
  )
  const wrongTypeItems = providedMetaData.filter(
    (meta) =>
      (meta.name === name ||
        alternativeNames.find((alternativeName) => alternativeName === meta.name)) &&
      meta.type !== type,
  )

  if (name === 'applicationAnswers') {
    // Parse expected questions
    const expectedQuestions = safeParseJSON<ParsedQuestion[]>(type)
    if (!expectedQuestions) {
      return errorResponse('Cannot assess if all expected questions are provided')
    }

    // Find the provided applicationAnswers metadata and parse it
    const providedEntry = providedMetaData.find((meta) => meta.name === 'applicationAnswers')
    if (!providedEntry) {
      return errorResponse('Application Answers are not provided')
    }

    const providedQuestions = safeParseJSON<ParsedQuestion[]>(providedEntry.type)
    if (!providedQuestions) {
      return errorResponse('Cannot assess provided questions: invalid JSON')
    }

    // Identify missing questions (either missing key or mismatched type)
    const missingQuestions = expectedQuestions.filter(
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
  } else if (name === 'additionalScores') {
    // Parse expected scores (assumed to be an array of strings)
    const expectedScores = safeParseJSON<string[]>(type)
    if (!expectedScores) {
      return errorResponse('Cannot assess if all expected scores are provided')
    }

    const providedEntry = providedMetaData.find((meta) => meta.name === 'additionalScores')
    if (!providedEntry) {
      return errorResponse('Additional Scores are not provided')
    }

    const providedScores = safeParseJSON<string[]>(providedEntry.type)
    if (!providedScores) {
      return errorResponse('Cannot assess provided scores: invalid JSON')
    }

    const missingScores = expectedScores.filter((expected) => !providedScores.includes(expected))

    if (missingScores.length === 0) {
      return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
    } else {
      return {
        color: 'bg-yellow-200 text-yellow-800',
        icon: <AlertTriangle className='w-3 h-3' />,
        tooltip: 'Missing or wrong scores: ' + missingScores.join(', '),
      }
    }
  } else if (wrongTypeItems.length > 0) {
    return {
      color: 'bg-yellow-200 text-yellow-800',
      icon: <AlertCircle className='w-3 h-3' />,
      tooltip: 'Conflict (Wrong type): expecting type: ' + type,
    }
  } else if (matchingItems.length === 0) {
    return {
      color: 'bg-red-200 text-red-800',
      icon: <AlertCircle className='w-3 h-3' />,
      tooltip: `${name} is not provided`,
    }
  } else if (matchingItems.length === 1) {
    return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
  }

  return {
    color: 'bg-yellow-200 text-yellow-800',
    icon: <AlertTriangle className='w-3 h-3' />,
    tooltip: 'Conflict: metadata provided multiple times',
  }
}
