import { AdditionalScore } from '../../../interfaces/additionalScore/additionalScore'
import { ApplicationParticipation } from '../../../interfaces/applicationParticipation'
import { saveAs } from 'file-saver'

export const downloadApplications = (
  data: ApplicationParticipation[],
  additionalScores: AdditionalScore[] = [],
  filename = 'application-export.csv',
) => {
  if (!data || data.length === 0) {
    console.error('No data available to download.')
    return
  }

  const csvHeaders = [
    'firstName',
    'lastName',
    'email',
    'matriculationNumber',
    'universityLogin',
    'hasUniversityAccount',
    'gender',
    'passStatus',
    'score',
    ...additionalScores.map((score) => score.key),
  ]
  const csvRows = data.map((row) => {
    // Extract student data
    const student = row.student || {}
    // Create a row with the required headers
    return csvHeaders
      .map((header) => {
        if (header in student) {
          // Fetch data from the `student` object
          return JSON.stringify(student[header] ?? '')
        } else if (header === 'passStatus') {
          // Fetch data from the main `ApplicationParticipation` object
          return JSON.stringify(row.passStatus ?? '')
        } else if (header === 'score') {
          return JSON.stringify(row.score ?? '')
        } else if (additionalScores.map((score) => score.key).includes(header)) {
          // Fetch additional scores from the `meta_data` object
          return JSON.stringify(row.restrictedData?.[header] ?? '')
        } else {
          return JSON.stringify('')
        }
      })
      .join(';')
  })

  const stringifiedHeaders = csvHeaders.map((header) => JSON.stringify(header))
  const csvContent = [stringifiedHeaders.join(';'), ...csvRows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}
