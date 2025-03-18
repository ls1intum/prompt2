import { Tutor } from '../../../interfaces/Tutor'
import { Seat } from '../../../interfaces/Seat'
import { TutorAssignmentFilterOptions } from '../interfaces/TutorAssignmentFilterOptions'
import { getTutorName } from '../utils/getTutorName'

export const useGetFilteredSeats = (
  seats: Seat[],
  searchTerm: string,
  filterOptions: TutorAssignmentFilterOptions,
  tutors: Tutor[],
): Seat[] => {
  return seats.filter((seat) => {
    // Search filter
    const matchesSearch =
      seat?.seatName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      false ||
      (seat?.assignedTutor !== null &&
        getTutorName(seat.assignedTutor, tutors)
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase())) ||
      false

    // Assignment filter
    const matchesAssignmentFilter =
      (seat.assignedTutor && filterOptions.showAssigned) ||
      (!seat.assignedTutor && filterOptions.showUnassigned)

    // Mac filter
    const matchesMacFilter =
      (seat.hasMac && filterOptions.showWithMac) || (!seat.hasMac && filterOptions.showWithoutMac)

    return matchesSearch && matchesAssignmentFilter && matchesMacFilter
  })
}
