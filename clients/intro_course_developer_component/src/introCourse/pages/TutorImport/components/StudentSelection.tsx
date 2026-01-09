import { Button, Checkbox, Label } from '@tumaet/prompt-ui-components'
import { Student } from '@tumaet/prompt-shared-state'

interface StudentSelectionProps {
  students: Student[]
  selectedStudents: string[]
  onStudentToggle: (studentId: string) => void
  onSelectAll: () => void
}

export const StudentSelection = ({
  students,
  selectedStudents,
  onStudentToggle,
  onSelectAll,
}: StudentSelectionProps) => {
  return (
    <div className='grid gap-2'>
      <div className='flex items-center justify-between'>
        <Label>Select Students</Label>
        <Button variant='outline' size='sm' onClick={onSelectAll}>
          {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      <div className='overflow-y-auto border rounded-md p-2 max-h-[300px]'>
        {students.map((student) => (
          <div key={student.id} className='flex items-center space-x-2 py-2'>
            <Checkbox
              id={`student-${student.id}`}
              checked={student.id ? selectedStudents.includes(student.id) : false}
              onCheckedChange={() => onStudentToggle(student.id!)}
            />
            <Label htmlFor={`student-${student.id}`} className='flex-1 cursor-pointer'>
              <div>
                {student.firstName} {student.lastName}
              </div>
              <div className='text-sm text-muted-foreground'>{student.email}</div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
