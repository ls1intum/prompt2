import { useCallback } from 'react'
import { Seat } from '../../../interfaces/Seat'
import { DeveloperWithProfile } from '../interfaces/DeveloperWithProfile'
import { Tutor } from 'src/introCourse/interfaces/Tutor'
import { getTutorName } from '../utils/getTutorName'

export const useDownloadAssignment = (
  seats: Seat[],
  developerWithProfiles: DeveloperWithProfile[],
  tutors: Tutor[],
) => {
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
      ['Seat', 'Has Mac', 'Device ID', 'Assigned Student', 'Assigned Tutor'].join(','),
      ...seats
        .filter((seat) => seat.assignedStudent || seat.assignedTutor || seat.hasMac)
        .map((seat) =>
          [
            seat.seatName,
            seat.hasMac ? 'Yes' : 'No',
            seat.deviceID || '',
            getStudentName(seat.assignedStudent),
            getTutorName(seat.assignedTutor, tutors),
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
