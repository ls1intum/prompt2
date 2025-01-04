import { ApplicationParticipation } from '@/interfaces/application_participations'
import { saveAs } from 'file-saver'

export const downloadApplications = (
  data: ApplicationParticipation[],
  additionalScoreNames: string[] = [],
  filename = 'application-export.csv',
) => {
  if (!data || data.length === 0) {
    console.error('No data available to download.')
    return
  }

  const csvHeaders = [
    'first_name',
    'last_name',
    'email',
    'matriculation_number',
    'university_login',
    'has_university_account',
    'gender',
    'pass_status',
    'score',
    ...additionalScoreNames,
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
        } else if (header === 'pass_status') {
          // Fetch data from the main `ApplicationParticipation` object
          return JSON.stringify(row.pass_status ?? '')
        } else if (header === 'score') {
          return JSON.stringify(row.score ?? '')
        } else if (additionalScoreNames.includes(header)) {
          // Fetch additional scores from the `meta_data` object
          return JSON.stringify(row.meta_data?.[header] ?? '')
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
