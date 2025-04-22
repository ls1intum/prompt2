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

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TriangleAlert } from 'lucide-react'

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
              <TableHead>Email</TableHead>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {hasSubmitted ? (
                              <div className='flex items-center'>
                                <div className='bg-green-100 text-green-700 p-1 rounded-full'>
                                  <Check className='h-4 w-4' />
                                </div>
                              </div>
                            ) : (
                              <div className='flex items-center'>
                                <div className='bg-orange-100 text-orange-700 p-1 rounded-full'>
                                  <TriangleAlert className='h-4 w-4' />
                                </div>
                              </div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {hasSubmitted ? 'Survey not submitted yet' : 'Survey submitted'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='flex items-center'>
                              <div className='bg-red-100 text-red-700 p-1 rounded-full'>
                                <X className='h-4 w-4' />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Survey not submitted yet</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
