import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { saveAs } from 'file-saver'
import { ExtraParticipationTableColumn } from '../interfaces/ExtraParticipationTableColumn'

export const downloadParticipations = (
  data: CoursePhaseParticipationWithStudent[],
  prevDataKeys: string[],
  restrictedDataKeys: string[],
  studentReadableDataKeys: string[],
  extraColumns: ExtraParticipationTableColumn[] = [],
  filename = 'participation-export.csv',
) => {
  if (!data || data.length === 0) {
    console.error('No data available to download.')
    return
  }

  const baseHeaders = [
    'firstName',
    'lastName',
    'email',
    'matriculationNumber',
    'universityLogin',
    'hasUniversityAccount',
    'courseParticipationID',
    'gender',
    'passStatus',
    ...prevDataKeys,
    ...restrictedDataKeys,
    ...studentReadableDataKeys,
  ]

  const extraHeaders = extraColumns.map((col) => col.header)
  const csvHeaders = [...baseHeaders, ...extraHeaders]

  const csvRows = data.map((row) => {
    const student = row.student || {}

    return csvHeaders
      .map((header) => {
        if (header in student) {
          return JSON.stringify(student[header] ?? '')
        } else if (header === 'passStatus') {
          return JSON.stringify(row.passStatus ?? '')
        } else if (prevDataKeys.includes(header)) {
          return JSON.stringify(row.prevData[header] ?? '')
        } else if (restrictedDataKeys.includes(header)) {
          return JSON.stringify(row.restrictedData[header] ?? '')
        } else if (studentReadableDataKeys.includes(header)) {
          return JSON.stringify(row.studentReadableData[header] ?? '')
        } else if (header === 'courseParticipationID') {
          return JSON.stringify(row.courseParticipationID ?? '')
        } else {
          // Attempt to find matching extra column
          const matchingExtraColumn = extraColumns.find((col) => col.header === header)
          if (matchingExtraColumn) {
            const extraDataItem = matchingExtraColumn.extraData.find(
              (item) => item.courseParticipationID === row.courseParticipationID,
            )
            return JSON.stringify(extraDataItem?.stringValue ?? '')
          }
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
