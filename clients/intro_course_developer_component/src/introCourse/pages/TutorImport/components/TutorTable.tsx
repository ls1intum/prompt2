import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllTutors } from '../../../network/queries/getAllTutors'
import { Tutor } from '../../../interfaces/Tutor'
import translations from '@/lib/translations.json'

export function TutorTable() {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: tutors,
    isLoading: isLoading,
    isError: isTutorsLoadingError,
  } = useQuery<Tutor[]>({
    queryKey: ['tutors', phaseId],
    queryFn: () => getAllTutors(phaseId ?? ''),
  })

  if (isTutorsLoadingError) {
    return <div>Failed to load tutors</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-grow max-w-md w-full'>
          <Input
            type='search'
            placeholder='Search tutors...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mat Nr</TableHead>
              <TableHead>{translations.university['login-name']}</TableHead>

              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className='h-5 w-full animate-pulse rounded bg-muted' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tutors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  No tutors found.
                </TableCell>
              </TableRow>
            ) : (
              tutors?.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className='font-medium'>{tutor.firstName}</TableCell>
                  <TableCell className='font-medium'>{tutor.lastName}</TableCell>
                  <TableCell>{tutor.email}</TableCell>
                  <TableCell>{tutor.matriculationNumber}</TableCell>
                  <TableCell>{tutor.universityLogin}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
