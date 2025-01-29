import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { saveAs } from 'file-saver'

export const downloadParticipations = (
  data: CoursePhaseParticipationWithStudent[],
  prevDataKeys: string[],
  restrictedDataKeys: string[],
  studentReadableDataKeys: string[],
  filename = 'participation-export.csv',
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
    ...prevDataKeys,
    ...restrictedDataKeys,
    ...studentReadableDataKeys,
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
        } else if (prevDataKeys.includes(header)) {
          // Fetch additional scores from the `meta_data` object
          return JSON.stringify(row.prevData[header] ?? '')
        } else if (restrictedDataKeys.includes(header)) {
          // Fetch additional scores from the `meta_data` object
          return JSON.stringify(row.restrictedData[header] ?? '')
        } else if (studentReadableDataKeys.includes(header)) {
          // Fetch additional scores from the `meta_data` object
          return JSON.stringify(row.studentReadableData[header] ?? '')
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
