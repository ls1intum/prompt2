import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, UserPlus } from 'lucide-react'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useQuery } from '@tanstack/react-query'
import { getStudentsOfCoursePhase } from '../../../network/queries/getStudentsOfCoursePhase'
import { StudentSelection } from './StudentSelection'
import { Student } from '@tumaet/prompt-shared-state'
import { Label } from '@/components/ui/label'

export function TutorImportDialog() {
  // Get the courses from the store
  const { courses } = useCourseStore()

  // Local state management
  const [open, setOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // Handlers for course and phase changes
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    setSelectedPhase(null)
    setSelectedStudents([])
  }

  const handlePhaseChange = (phaseId: string) => {
    setSelectedPhase(phaseId)
    setSelectedStudents([])
  }

  // Handler for toggling individual student selection
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  // Handler for (de)selecting all students
  const handleSelectAll = (students: Student[]) => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map((s) => s.id).filter((id) => id !== undefined))
    }
  }

  // Fetch students using React Query when a course and phase are selected
  const {
    data: students,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
  } = useQuery<Student[]>({
    queryKey: ['students', selectedPhase],
    queryFn: () => {
      if (selectedCourse && selectedPhase) {
        return getStudentsOfCoursePhase(selectedPhase)
      }
      return Promise.resolve([])
    },
    enabled: !!selectedCourse && !!selectedPhase,
  })

  const handleImport = async () => {
    if (!selectedCourse || !selectedPhase || selectedStudents.length === 0) return

    setIsImporting(true)

    try {
      // Get the selected student data from the fetched list
      const selectedStudentData = (students || []).filter(
        (s) => s.id && selectedStudents.includes(s.id),
      )

      // TODO: Import request to intro course server

      // Reset state and close the dialog
      setOpen(false)
      setSelectedCourse(null)
      setSelectedPhase(null)
      setSelectedStudents([])
    } finally {
      setIsImporting(false)
    }
  }

  const currentCourse = selectedCourse ? courses.find((c) => c.id === selectedCourse) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className='mr-2 h-4 w-4' />
          Import Tutors
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Import Tutors</DialogTitle>
          <DialogDescription>
            Select students from other courses to import as tutors.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {/* Course Selection */}
          <div className='grid gap-2'>
            <Label htmlFor='course'>Select Course</Label>
            <Select value={selectedCourse || ''} onValueChange={handleCourseChange}>
              <SelectTrigger id='course'>
                <SelectValue placeholder='Select a course' />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phase Selection */}
          {selectedCourse && (
            <div className='grid gap-2'>
              <Label htmlFor='phase'>Select Course Phase</Label>
              <Select value={selectedPhase || ''} onValueChange={handlePhaseChange}>
                <SelectTrigger id='phase'>
                  <SelectValue placeholder='Select a phase' />
                </SelectTrigger>
                <SelectContent>
                  {currentCourse?.coursePhases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Student Selection */}
          {selectedPhase && (
            <div className='grid gap-2'>
              {isStudentsLoading && <div>Loading students...</div>}
              {isStudentsError && <div>Error loading students.</div>}
              {students && (
                <StudentSelection
                  students={students}
                  selectedStudents={selectedStudents}
                  onStudentToggle={handleStudentToggle}
                  onSelectAll={() => handleSelectAll(students)}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='submit'
            onClick={handleImport}
            disabled={
              !selectedCourse || !selectedPhase || selectedStudents.length === 0 || isImporting
            }
          >
            {isImporting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Importing...
              </>
            ) : (
              'Import Selected Students'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
