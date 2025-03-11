import { useState } from 'react'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useQuery } from '@tanstack/react-query'
import type { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'
import type { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { ErrorPage } from '@/components/ErrorPage'
import {
  Laptop,
  Loader2,
  Smartphone,
  Tablet,
  Watch,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProfileDetailsDialog } from './components/ProfileDetailsDialog'

export const DeveloperProfilesLecturerPage = () => {
  // State for the detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participation: any
    profile: DeveloperProfile | null
  } | null>(null)

  // Add state for sorting after the selectedParticipant state
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'ascending' | 'descending'
  } | null>(null)

  // Get the developer profile and course phase paricipations
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

  // Match participants with their developer profiles
  const participantsWithProfiles =
    coursePhaseParticipations?.participations.map((participation) => {
      const profile =
        developerProfiles?.find(
          (devProfile) => devProfile.courseParticipationID === participation.courseParticipationID,
        ) || null

      return {
        participation,
        profile,
      }
    }) || []

  // Add this sorting function before the return statement
  const sortedParticipants = [...participantsWithProfiles].sort((a, b) => {
    if (!sortConfig) return 0

    let aValue, bValue

    if (sortConfig.key === 'name') {
      aValue =
        `${a.participation.student.firstName} ${a.participation.student.lastName}`.toLowerCase()
      bValue =
        `${b.participation.student.firstName} ${b.participation.student.lastName}`.toLowerCase()
    } else if (sortConfig.key === 'profileStatus') {
      aValue = a.profile ? 1 : 0
      bValue = b.profile ? 1 : 0
    } else {
      return 0
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1
    }
    return 0
  })

  // Add this function to handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }

    setSortConfig({ key, direction })
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <ManagementPageHeader>Developer Profile Management</ManagementPageHeader>
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
            <TableHead>Email</TableHead>
            <TableHead className='cursor-pointer' onClick={() => requestSort('profileStatus')}>
              <div className='flex items-center'>
                Survey
                {sortConfig?.key === 'profileStatus' ? (
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
            <TableHead>Devices</TableHead>
            <TableHead>GitLab Username</TableHead>
            <TableHead>Apple ID</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map(({ participation, profile }) => (
            <TableRow
              key={participation.courseParticipationID}
              className='cursor-pointer hover:bg-muted/50'
              onClick={() => setSelectedParticipant({ participation, profile })}
            >
              <TableCell className='font-medium'>
                {participation.student.firstName} {participation.student.lastName}
              </TableCell>
              <TableCell>{participation.student.email}</TableCell>
              <TableCell>
                {profile ? (
                  <div className='flex items-center'>
                    <div className='bg-green-100 text-green-700 p-1 rounded-full'>
                      <Check className='h-4 w-4' />
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center'>
                    <div className='bg-red-100 text-red-700 p-1 rounded-full'>
                      <X className='h-4 w-4' />
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  {profile?.hasMacBook && <Laptop className='h-5 w-5 text-slate-600' />}
                  {profile?.iPhoneUUID && <Smartphone className='h-5 w-5 text-slate-600' />}
                  {profile?.iPadUUID && <Tablet className='h-5 w-5 text-slate-600' />}
                  {profile?.appleWatchUUID && <Watch className='h-5 w-5 text-slate-600' />}
                  {!profile?.hasMacBook &&
                    !profile?.iPhoneUUID &&
                    !profile?.iPadUUID &&
                    !profile?.appleWatchUUID && (
                      <span className='text-muted-foreground text-sm italic'>No devices</span>
                    )}
                </div>
              </TableCell>
              <TableCell>
                {profile?.gitLabUsername || (
                  <span className='text-muted-foreground text-sm italic'>Not set</span>
                )}
              </TableCell>
              <TableCell>
                {profile?.appleID || (
                  <span className='text-muted-foreground text-sm italic'>Not set</span>
                )}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedParticipant({ participation, profile })
                  }}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedParticipant && (
        <ProfileDetailsDialog
          participant={selectedParticipant.participation}
          profile={selectedParticipant.profile}
          phaseId={phaseId || ''}
          onClose={() => setSelectedParticipant(null)}
          onSaved={handleRefresh}
        />
      )}
    </div>
  )
}
