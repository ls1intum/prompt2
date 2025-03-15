import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Seat } from 'src/introCourse/interfaces/Seat'
import { Tutor } from 'src/introCourse/interfaces/Tutor'
import { useEffect, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TutorAssignmentFilter } from './TutorAssignmentFilter'
import { useGetFilteredSeats } from '../../hooks/useGetFilteredSeats'
import { TutorAssignmentFilterOptions } from '../../interfaces/TutorAssignmentFilterOptions'

interface SeatTutorTableProps {
  allSeats: Seat[]
  tutors: Tutor[]
  selectedSeatNames: string[]
  setSelectedSeatNames: React.Dispatch<React.SetStateAction<string[]>>
  handleTutorAssignment: (seatName: string, tutorId: string | null) => void
}

export const SeatTutorTable = ({
  allSeats,
  selectedSeatNames,
  setSelectedSeatNames,
  tutors,
  handleTutorAssignment,
}: SeatTutorTableProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [filterOptions, setFilterOptions] = useState<TutorAssignmentFilterOptions>({
    showAssigned: true,
    showUnassigned: true,
    showWithMac: true,
    showWithoutMac: true,
  })

  // handle the filter changes
  const filteredSeats = useGetFilteredSeats(allSeats, searchTerm, filterOptions, tutors)

  // Check if all filtered seats are selected
  const areAllSelected =
    filteredSeats.length > 0 && selectedSeatNames.length === filteredSeats.length
  const areSomeSelected =
    selectedSeatNames.length > 0 && selectedSeatNames.length < filteredSeats.length

  // whenever a row is not shown any more it shall be deselected
  useEffect(() => {
    setSelectedSeatNames((prev) =>
      prev.filter((name) => filteredSeats.some((seat) => seat.seatName === name)),
    )
  }, [filteredSeats, setSelectedSeatNames])

  // Handle checkbox click with shift selection functionality
  const handleCheckboxClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    seatName: string,
    currentIndex: number,
  ) => {
    const isCurrentlySelected = selectedSeatNames.includes(seatName)
    // Determine new selection state for the clicked checkbox
    const newSelectedState = !isCurrentlySelected

    if (e.shiftKey && lastSelectedIndex !== null) {
      // Calculate the range in the filtered seats list based on indices
      const startIndex = Math.min(lastSelectedIndex, currentIndex)
      const endIndex = Math.max(lastSelectedIndex, currentIndex)
      const seatsInRange = filteredSeats
        .slice(startIndex, endIndex + 1)
        .map((seat) => seat.seatName)

      let newSelection: string[]
      if (newSelectedState) {
        // Add all seats in the range to the current selection
        newSelection = Array.from(new Set([...selectedSeatNames, ...seatsInRange]))
      } else {
        // Remove all seats in the range from the current selection
        newSelection = selectedSeatNames.filter((name) => !seatsInRange.includes(name))
      }
      setSelectedSeatNames(newSelection)
    } else {
      // Normal toggle if shift key is not pressed
      setSelectedSeatNames((prev) =>
        prev.includes(seatName) ? prev.filter((name) => name !== seatName) : [...prev, seatName],
      )
    }
    // Update last selected index for future shift selections
    setLastSelectedIndex(currentIndex)
  }

  const handleSelectAll = () => {
    if (selectedSeatNames.length === filteredSeats.length) {
      // If all are selected, deselect all
      setSelectedSeatNames([])
    } else {
      // Otherwise, select all filtered seats
      setSelectedSeatNames(filteredSeats.map((seat) => seat.seatName))
    }
  }

  return (
    <div className='flex-1 space-y-4'>
      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='relative flex-grow max-w-md w-full'>
          <Input
            type='search'
            placeholder='Search seats or tutors...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
        </div>

        <TutorAssignmentFilter filterOptions={filterOptions} setFilterOptions={setFilterOptions} />
      </div>

      <div className='border rounded-md max-h-[60vh] overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40px]'>
                <Checkbox
                  checked={areAllSelected || (areSomeSelected && 'indeterminate')}
                  onCheckedChange={handleSelectAll}
                  aria-label='Select all seats'
                />
              </TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Mac</TableHead>
              <TableHead className='w-[50%]'>Assigned Tutor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeats.length > 0 ? (
              filteredSeats.map((seat, index) => {
                const isSelected = selectedSeatNames.includes(seat.seatName)

                return (
                  <TableRow key={seat.seatName} className={isSelected ? 'bg-muted/50' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        // Use onClick to handle shift selection
                        onClick={(e) => handleCheckboxClick(e, seat.seatName, index)}
                        aria-label={`Select seat ${seat.seatName}`}
                      />
                    </TableCell>
                    <TableCell className='font-medium'>{seat.seatName}</TableCell>
                    <TableCell>
                      {seat.hasMac ? (
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-600 hover:bg-blue-50'
                        >
                          Mac
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-xs'>No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={seat.assignedTutor || ''}
                        onValueChange={(value) =>
                          handleTutorAssignment(seat.seatName, value === 'none' ? null : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a tutor' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          {tutors.map((tutor) => (
                            <SelectItem key={tutor.id} value={tutor.id}>
                              {tutor.firstName} {tutor.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-4 text-muted-foreground'>
                  {searchTerm ? 'No seats match your search' : 'No seats available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
