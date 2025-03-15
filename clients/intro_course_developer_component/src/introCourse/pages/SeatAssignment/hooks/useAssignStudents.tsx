import { useCallback } from 'react'
import { Seat } from '../../../interfaces/Seat'
import { useUpdateSeats } from './useUpdateSeats'
import { DeveloperWithProfile } from '../interfaces/DeveloperWithProfile'

export const useAssignStudents = (
  seats: Seat[],
  developerWithProfiles: DeveloperWithProfile[],
  setError: (error: string | null) => void,
) => {
  // update function to update the seats
  const mutation = useUpdateSeats(setError)

  // Helper function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => array.slice().sort(() => Math.random() - 0.5)

  // Helper function to check if user can assign students
  const canAssignStudents = useCallback(() => {
    const seatsWithTutors = seats.filter((seat) => seat.assignedTutor).length
    const studentsWithoutMacs = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === false,
    ).length
    const seatsWithMacs = seats.filter((seat) => seat.hasMac).length

    if (seatsWithTutors < developerWithProfiles.length) {
      setError(
        `Not enough seats with tutors assigned. Need ${developerWithProfiles.length} seats with tutors, but only have ${seatsWithTutors}.`,
      )
      return false
    }
    if (seatsWithMacs < studentsWithoutMacs) {
      setError(
        `Not enough seats with Macs. Need ${studentsWithoutMacs} seats with Macs for students without Macs, but only have ${seatsWithMacs}.`,
      )
      return false
    }
    setError(null)
    return true
  }, [seats, developerWithProfiles, setError])

  return useCallback(() => {
    if (!canAssignStudents()) return

    // Create a copy and clear any existing student assignments
    const updatedSeats: Seat[] = seats.map((seat) => ({ ...seat, assignedStudent: null }))
    const eligibleSeats = updatedSeats.filter((seat) => seat.assignedTutor)

    // Separate students by Mac ownership
    const studentsWithMacs = developerWithProfiles.filter((dev) => dev.profile?.hasMacBook === true)
    const studentsWithoutMacs = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === false,
    )
    const studentsUnknownMac = developerWithProfiles.filter(
      (dev) => dev.profile?.hasMacBook === undefined,
    )

    // Separate eligible seats by Mac availability
    const seatsWithMacs = eligibleSeats.filter((seat) => seat.hasMac)
    const seatsWithoutMacs = eligibleSeats.filter((seat) => !seat.hasMac)

    // Randomize arrays
    const shuffledStudentsWithoutMacs = shuffleArray(studentsWithoutMacs)
    const shuffledStudentsWithMacs = shuffleArray(studentsWithMacs)
    const shuffledStudentsUnknownMac = shuffleArray(studentsUnknownMac)
    const shuffledSeatsWithMacs = shuffleArray(seatsWithMacs)
    const shuffledSeatsWithoutMacs = shuffleArray(seatsWithoutMacs)

    // Assign students without Macs first to seats with Macs
    shuffledStudentsWithoutMacs.forEach((student, index) => {
      if (index < shuffledSeatsWithMacs.length) {
        const seatName = shuffledSeatsWithMacs[index].seatName
        const seatIndex = updatedSeats.findIndex((s) => s.seatName === seatName)
        if (seatIndex !== -1) {
          updatedSeats[seatIndex].assignedStudent = student.participation.student.id ?? null
        }
      }
    })

    // Assign remaining students to remaining seats
    const remainingSeatsWithMacs = shuffledSeatsWithMacs.slice(shuffledStudentsWithoutMacs.length)
    const allRemainingSeats = [...remainingSeatsWithMacs, ...shuffledSeatsWithoutMacs]
    const allRemainingStudents = [...shuffledStudentsWithMacs, ...shuffledStudentsUnknownMac]

    allRemainingStudents.forEach((student, index) => {
      if (index < allRemainingSeats.length) {
        const seatName = allRemainingSeats[index].seatName
        const seatIndex = updatedSeats.findIndex((s) => s.seatName === seatName)
        if (seatIndex !== -1) {
          updatedSeats[seatIndex].assignedStudent = student.participation.student.id ?? null
        }
      }
    })

    mutation.mutate(updatedSeats)
  }, [seats, developerWithProfiles, canAssignStudents, mutation])
}
