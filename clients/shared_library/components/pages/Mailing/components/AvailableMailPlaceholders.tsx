import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tumaet/prompt-ui-components'
import translations from '@/lib/translations.json'

interface AvailableMailPlaceholdersProps {
  customAdditionalPlaceholders?: { placeholder: string; description: string }[]
}

export const availablePlaceholders = [
  {
    placeholder: '{{firstName}}',
    description: 'The first name of the student',
  },
  {
    placeholder: '{{lastName}}',
    description: 'The last name of the student',
  },
  {
    placeholder: '{{email}}',
    description: 'The email of the student',
  },
  {
    placeholder: '{{matriculationNumber}}',
    description: 'The matriculation number of the student. Might be empty',
  },
  {
    placeholder: '{{universityLogin}}',
    description: `The ${translations.university['login-name']} of the student. Might be empty`,
  },
  {
    placeholder: '{{studyDegree}}',
    description: 'The study degree of the student',
  },
  {
    placeholder: '{{currentSemester}}',
    description: 'The current semester of the student',
  },
  {
    placeholder: '{{studyProgram}}',
    description: 'The study program of the student',
  },

  {
    placeholder: '{{courseName}}',
    description: 'The name of the course',
  },
  {
    placeholder: '{{courseStartDate}}',
    description: 'The start date of the course',
  },
  {
    placeholder: '{{courseEndDate}}',
    description: 'The end date of the course',
  },
]

export const AvailableMailPlaceholders = ({
  customAdditionalPlaceholders,
}: AvailableMailPlaceholdersProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const placeholders = [...availablePlaceholders]

  if (customAdditionalPlaceholders) {
    placeholders.push(...customAdditionalPlaceholders)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='space-y-2 border rounded-md'>
      <div
        className='flex items-center justify-between p-4 cursor-pointer'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div>
          <h3 className='text-sm font-medium'>Available Placeholders</h3>
          <p className='text-xs text-muted-foreground mt-1'>
            Use these placeholders in your email templates. They will be replaced with actual values
            when the email is sent.
          </p>
        </div>
        {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
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
                {placeholders.map((placeholder) => (
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
