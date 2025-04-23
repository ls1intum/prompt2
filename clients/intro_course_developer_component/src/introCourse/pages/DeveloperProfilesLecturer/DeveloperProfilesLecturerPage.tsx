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
  Download,
  TriangleAlert,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProfileDetailsDialog } from './components/ProfileDetailsDialog'
import { useGetParticipationsWithProfiles } from './hooks/useGetParticipationsWithProfiles'
import { useGetSortedParticipations } from './hooks/useGetSortedParticipations'
import { FilterMenu } from './components/FilterMenu'
import { DevProfileFilter } from './interfaces/devProfileFilter'
import { useGetFilteredParticipations } from './hooks/useGetFilteredParticipations'
import { useDownloadDeveloperProfiles } from './hooks/useDownloadDeveloperProfiles'
import { GitlabStatus } from '../../interfaces/GitlabStatus'
import { getGitlabStatuses } from '../../network/queries/getGitlabStatuses'
import { ParticipationWithDevProfiles } from './interfaces/pariticipationWithDevProfiles'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { CreateGitlabReposDialog } from './components/CreateGitlabReposDialog'
import { useCustomElementWidth } from '@/hooks/useCustomElementWidth'

export const DeveloperProfilesLecturerPage = () => {
  // State for the detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState<
    ParticipationWithDevProfiles | undefined
  >(undefined)

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
    surveyStatus: {
      completed: false,
      notCompleted: false,
    },
    devices: {
      macBook: false,
      iPhone: false,
      iPad: false,
      appleWatch: false,
      noDevices: false,
    },
    gitlabNotCreated: false,
  })

  // Get the developer profile and course phase participations
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

  // getting the Gitlab Statuses
  const {
    data: gitlabStatuses,
    isPending: isGitlabStatusesPending,
    isError: isGitlabStatusesError,
    refetch: refetchGitlabStatuses,
  } = useQuery<GitlabStatus[]>({
    queryKey: ['gitlab_statuses', phaseId],
    queryFn: () => getGitlabStatuses(phaseId ?? ''),
  })

  const isError = isParticipationsError || isDeveloperProfileError || isGitlabStatusesError
  const isPending =
    isCoursePhaseParticipationsPending || isDeveloperProfilesPending || isGitlabStatusesPending

  const handleRefresh = () => {
    refetchCoursePhaseParticipations()
    refetchDeveloperProfiles()
    refetchGitlabStatuses()
  }

  const tableWidth = useCustomElementWidth('table-view', 10)

  // Match participants with their developer profiles
  const participantsWithProfiles = useGetParticipationsWithProfiles(
    coursePhaseParticipations?.participations || [],
    developerProfiles || [],
    gitlabStatuses || [],
  )

  // Add this sorting function before the return statement
  const sortedParticipants = useGetSortedParticipations(sortConfig, participantsWithProfiles)

  // Filter participants based on the current filter settings
  const filteredParticipants = useGetFilteredParticipations(sortedParticipants, filters)

  const downloadProfiles = useDownloadDeveloperProfiles()

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
    <div id='table-view' className='space-y-6'>
      <ManagementPageHeader>Developer Profile Management</ManagementPageHeader>
      <div className='flex justify-between items-end'>
        <div className='text-sm text-muted-foreground'>
          Showing {filteredParticipants.length} of {sortedParticipants.length} participants
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => downloadProfiles(participantsWithProfiles)}>
            <Download className='h-4 w-4 mr-2' />
            Download Profiles
          </Button>
          <CreateGitlabReposDialog participantsWithDevProfiles={participantsWithProfiles} />
          <FilterMenu filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div className='rounded-md border' style={{ width: `${tableWidth}px` }}>
        <div className='overflow-x-auto'>
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
                <TableHead>Gitlab Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map(({ participation, devProfile, gitlabStatus }) => (
                <TableRow
                  key={participation.courseParticipationID}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() =>
                    setSelectedParticipant({ participation, devProfile, gitlabStatus })
                  }
                >
                  <TableCell className='font-medium'>
                    {participation.student.firstName} {participation.student.lastName}
                  </TableCell>
                  <TableCell>{participation.student.email}</TableCell>
                  <TableCell>
                    {devProfile ? (
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
                      {devProfile?.hasMacBook && <Laptop className='h-5 w-5 text-slate-600' />}
                      {devProfile?.iPhoneUDID && <Smartphone className='h-5 w-5 text-slate-600' />}
                      {devProfile?.iPadUDID && <Tablet className='h-5 w-5 text-slate-600' />}
                      {devProfile?.appleWatchUDID && <Watch className='h-5 w-5 text-slate-600' />}
                      {!devProfile?.hasMacBook &&
                        !devProfile?.iPhoneUDID &&
                        !devProfile?.iPadUDID &&
                        !devProfile?.appleWatchUDID && (
                          <span className='text-muted-foreground text-sm italic'>No devices</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {devProfile?.gitLabUsername || (
                      <span className='text-muted-foreground text-sm italic'>Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {devProfile?.appleID || (
                      <span className='text-muted-foreground text-sm italic'>Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {gitlabStatus ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {gitlabStatus.gitlabSuccess ? (
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
                            {gitlabStatus.gitlabSuccess
                              ? 'Repo created successfully'
                              : gitlabStatus.errorMessage}
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
                          <TooltipContent>Repository not yet created</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedParticipant({ participation, devProfile, gitlabStatus })
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedParticipant && (
        <ProfileDetailsDialog
          participantWithProfile={selectedParticipant}
          phaseId={phaseId || ''}
          onClose={() => {
            setSelectedParticipant(undefined)
          }}
          onSaved={handleRefresh}
        />
      )}
    </div>
  )
}
