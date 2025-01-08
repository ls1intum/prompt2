'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import translations from '@/lib/translations.json'

export const AvailableMailPlaceholders = () => {
  const [isOpen, setIsOpen] = useState(false)

  const availablePlaceholders = [
    {
      placeholder: '{{student.first_name}}',
      description: 'The first name of the student',
    },
    {
      placeholder: '{{student.last_name}}',
      description: 'The last name of the student',
    },
    {
      placeholder: '{{student.email}}',
      description: 'The email of the student',
    },
    {
      placeholder: '{{student.matriculation_number}}',
      description: 'The matriculation number of the student. Might be empty',
    },
    {
      placeholder: '{{student.university_login}}',
      description: `The ${translations.university['login-name']} of the student. Might be empty`,
    },
    {
      placeholder: '{{student.study_degree}}',
      description: 'The study degree of the student',
    },
    {
      placeholder: '{{student.current_semester}}',
      description: 'The current semester of the student',
    },
    {
      placeholder: '{{student.study_program}}',
      description: 'The study program of the student',
    },

    {
      placeholder: '{{course.name}}',
      description: 'The name of the course',
    },
    {
      placeholder: '{{course.start_date}}',
      description: 'The start date of the course',
    },
    {
      placeholder: '{{course.end_date}}',
      description: 'The end date of the course',
    },
    {
      placeholder: '{{meta_data.application_end_date}}',
      description: 'The end date of the the application phase',
    },
    {
      placeholder: 'https://{{applicationURL}}',
      description: 'The direct link to the application form',
    },
  ]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='space-y-2 border rounded-md'>
      <div className='flex items-center justify-between p-4'>
        <div>
          <h3 className='text-sm font-medium'>Available Placeholders</h3>
          <p className='text-xs text-muted-foreground mt-1'>
            Use these placeholders in your email templates. They will be replaced with actual values
            when the email is sent.
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm' className='w-9 p-0'>
            {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
            <span className='sr-only'>Toggle placeholders</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className='border-t'>
          <div className='max-h-[300px] overflow-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[200px]'>Placeholder</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availablePlaceholders.map((placeholder) => (
                  <TableRow key={placeholder.placeholder}>
                    <TableCell className='font-mono text-sm'>{placeholder.placeholder}</TableCell>
                    <TableCell className='text-sm'>{placeholder.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
