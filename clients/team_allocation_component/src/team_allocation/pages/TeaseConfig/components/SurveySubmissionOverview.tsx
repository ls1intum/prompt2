'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { TeaseStudent } from '../../../interfaces/tease/student'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface StudentTableProps {
  students: TeaseStudent[]
}

export const SurveySubmissionOverview = ({ students }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<TeaseStudent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleStudentClick = (student: TeaseStudent) => {
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
              <TableHead>University Login</TableHead>
              <TableHead>Survey Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const hasSubmitted = student.projectPreferences.length > 0

              return (
                <TableRow
                  key={student.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleStudentClick(student)}
                >
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {hasSubmitted ? (
                      <div className='flex items-center'>
                        <Check className='h-5 w-5 text-green-500 mr-1' />
                        <span className='text-sm text-green-600'>Completed</span>
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <X className='h-5 w-5 text-red-500 mr-1' />
                        <span className='text-sm text-red-600'>Not completed</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedStudent && (
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </DialogTitle>
              <DialogDescription>Student details and preferences</DialogDescription>
            </DialogHeader>

            <div className='space-y-6 py-4'>
              <div>
                <h3 className='text-lg font-medium mb-2'>Skills</h3>
                <div className='flex flex-wrap gap-2'>
                  {selectedStudent.skill && selectedStudent.skill.length > 0 ? (
                    selectedStudent.skill.map((skillItem, index) => (
                      <Badge key={index} variant='secondary'>
                        {String(skillItem)}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>No skills provided</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium mb-2'>Project Preferences</h3>
                {selectedStudent.projectPreferences &&
                selectedStudent.projectPreferences.length > 0 ? (
                  <ScrollArea className='h-[200px] rounded-md border p-4'>
                    <ol className='space-y-4'>
                      {selectedStudent.projectPreferences.map((preference, index) => (
                        <li key={index} className='border-b pb-2 last:border-0'>
                          <div className='font-medium'>
                            {index + 1}. {preference.projectId}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </ScrollArea>
                ) : (
                  <p className='text-sm text-muted-foreground'>No project preferences submitted</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

export default SurveySubmissionOverview
