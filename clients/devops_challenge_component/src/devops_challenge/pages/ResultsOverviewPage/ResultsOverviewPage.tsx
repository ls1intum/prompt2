import { Loader2, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

import { useParams } from 'react-router-dom'
import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

import {
  CoursePhaseParticipationWithStudent,
  PassStatus,
  CoursePhaseParticipationsWithResolution,
} from '@tumaet/prompt-shared-state'

import { Button } from '@/components/ui/button'
import { ErrorPage } from '@/components/ErrorPage'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'

import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'

import { FilterMenu } from './components/FilterMenu'
import { useGetParticipationsWithProfiles } from './hooks/useGetParticipationsWithProfiles'
import { useGetSortedParticipations } from './hooks/useGetSortedParticipations'
import { useGetFilteredParticipations } from './hooks/useGetFilteredParticipations'
import { DevProfileFilter } from './interfaces/devProfileFilter'

export const ResultsOverviewPage = (): JSX.Element => {
  const john: CoursePhaseParticipationWithStudent = {
    coursePhaseID: '1',
    courseParticipationID: '1',
    passStatus: PassStatus.FAILED,
    restrictedData: {},
    studentReadableData: {},
    prevData: {
      challenge_passed: false,
      attempts: 2,
    },
    student: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      hasUniversityAccount: false,
    },
  }
  const mike: CoursePhaseParticipationWithStudent = {
    coursePhaseID: '1',
    courseParticipationID: '1',
    passStatus: PassStatus.PASSED,
    restrictedData: {},
    studentReadableData: {},
    prevData: {
      challenge_passed: true,
      attempts: 3,
    },
    student: {
      id: '1',
      firstName: 'Mike',
      lastName: 'Master',
      email: '',
      hasUniversityAccount: false,
    },
  }
  const exampleParticipants = [john, mike]

  const exampleProfiles: DeveloperProfile[] = [
    {
      coursePhaseID: '1',
      courseParticipationID: '1',
      repositoryURL: '123',
      attempts: 2,
      maxAttempts: 3,
      hasPassed: true,
    },
  ]

  // Add state for sorting after the selectedParticipant state
  const [sortConfig, setSortConfig] = useState<
    | {
        key: string
        direction: 'ascending' | 'descending'
      }
    | undefined
  >(undefined)

  // Add filter state
  const [filters, setFilters] = useState<DevProfileFilter>({
    challengePassed: {
      passed: false,
      notPassed: false,
      failed: false,
    },
  })

  // get
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  const {
    data: developerProfiles,
    isPending: isDeveloperProfilesPending,
    isError: isDeveloperProfileError,
    refetch: refetchDeveloperProfiles,
  } = useQuery<DeveloperProfile[]>({
    queryKey: ['developerProfiles', phaseId],
    queryFn: () => getAllDeveloperProfiles(phaseId ?? ''),
  })

  const isError = isParticipationsError || isDeveloperProfileError
  const isPending = isCoursePhaseParticipationsPending || isDeveloperProfilesPending

  const handleRefresh = () => {
    refetchCoursePhaseParticipations()
    refetchDeveloperProfiles()
  }

  // Match participants with their developer profiles
  const participantsWithProfiles = useGetParticipationsWithProfiles(
    exampleParticipants || [],
    exampleProfiles || [],
  )

  // Add this sorting function before the return statement
  const sortedParticipants = useGetSortedParticipations(sortConfig, participantsWithProfiles)

  // Filter participants based on the current filter settings
  const filteredParticipants = useGetFilteredParticipations(sortedParticipants, filters)

  if (isError) {
    return <ErrorPage onRetry={handleRefresh} />
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  // Add this function to handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }

    setSortConfig({ key, direction })
  }

  return (
    <div className='space-y-6'>
      <ManagementPageHeader>Developer Profile Management</ManagementPageHeader>
      <div className='flex justify-between items-end'>
        <div className='text-sm text-muted-foreground'>
          Showing {filteredParticipants.length} of {sortedParticipants.length} participants
        </div>
        <FilterMenu filters={filters} setFilters={setFilters} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='cursor-pointer' onClick={() => requestSort('name')}>
              <div className='flex items-center'>
                Name
                {sortConfig?.key === 'name' ? (
                  <>
                    {sortConfig.direction === 'ascending' ? (
                      <ArrowUp className='ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDown className='ml-2 h-4 w-4' />
                    )}
                  </>
                ) : (
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                )}
              </div>
            </TableHead>
            <TableHead className='cursor-pointer' onClick={() => requestSort('attempts')}>
              <div className='flex items-center'>
                Attempts
                {sortConfig?.key === 'attempts' ? ( // Add this line
                  <>
                    {sortConfig.direction === 'ascending' ? (
                      <ArrowUp className='ml-2 h-4 w-4' />
                    ) : (
                      <ArrowDown className='ml-2 h-4 w-4' />
                    )}
                  </>
                ) : (
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParticipants.map(({ participation, profile }) => (
            <TableRow
              key={participation.courseParticipationID}
              className='cursor-pointer hover:bg-muted/50'
            >
              <TableCell className='font-medium'>
                {participation.student.firstName} {participation.student.lastName}
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  {profile?.attempts} / {profile?.maxAttempts}
                </div>
              </TableCell>
              {/* TODO add repo URL */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
