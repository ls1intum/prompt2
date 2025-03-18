import { useCallback } from 'react'
import { Seat } from '../../../interfaces/Seat'
import { DeveloperWithProfile } from '../interfaces/DeveloperWithProfile'
import { Tutor } from '../../../interfaces/Tutor'
import { getTutorName } from '../utils/getTutorName'

export const useDownloadAssignment = (
  seats: Seat[],
  developerWithProfiles: DeveloperWithProfile[],
  tutors: Tutor[],
) => {
  function escapeCsvField(field) {
    // If the field contains commas, quotes, or newlines, wrap it in quotes
    // and escape any quotes by doubling them.
    if (typeof field !== 'string') return field

    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  return useCallback(() => {
    const getStudentName = (studentId: string | null) => {
      if (!studentId) return 'Unassigned'
      const student = developerWithProfiles.find(
        (dev) => dev.participation.student.id === studentId,
      )
      return student
        ? `${student.participation.student.firstName} ${student.participation.student.lastName}`
        : 'Unknown'
    }

    const csvContent = [
      ['Seat', 'Seat Mac', 'Device ID', 'Assigned Student', 'Assigned Tutor'].join(','),
      ...seats
        .filter((seat) => seat.assignedStudent || seat.assignedTutor || seat.hasMac)
        .map((seat) =>
          [
            escapeCsvField(seat.seatName),
            seat.hasMac ? 'Yes' : 'No',
            escapeCsvField(seat.deviceID || ''),
            escapeCsvField(getStudentName(seat.assignedStudent)),
            escapeCsvField(getTutorName(seat.assignedTutor, tutors)),
          ].join(','),
        ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'seat_assignments.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [seats, developerWithProfiles, tutors])
}
