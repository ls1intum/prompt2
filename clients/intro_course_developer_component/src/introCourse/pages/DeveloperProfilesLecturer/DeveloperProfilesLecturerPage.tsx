import { useState } from 'react'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useQuery } from '@tanstack/react-query'
import type { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'
import type { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { ErrorPage } from '@/components/ErrorPage'
import { Laptop, Loader2, Smartphone, Tablet, Watch, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const DeveloperProfilesLecturerPage = () => {
  // State for the detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participation: any
    profile: DeveloperProfile | null
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

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <ManagementPageHeader>Developer Profile and Account Management</ManagementPageHeader>

      <Card>
        <CardContent className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold'>Participants ({participantsWithProfiles.length})</h2>
            <Button onClick={handleRefresh}>Refresh Data</Button>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Survey Completed</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>GitLab Username</TableHead>
                  <TableHead>Apple ID</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantsWithProfiles.map(({ participation, profile }) => (
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
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200'
                        >
                          Complete
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1'
                        >
                          <AlertCircle className='h-3.5 w-3.5' />
                          Missing Profile
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        {profile?.hasMacBook === true && (
                          <Laptop className='h-5 w-5 text-slate-600' />
                        )}
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
                        {profile ? 'Edit Profile' : 'Create Profile'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* {selectedParticipant && (
        <ProfileDetailDialog
          participant={selectedParticipant.participation}
          profile={selectedParticipant.profile}
          phaseId={phaseId || ''}
          onClose={() => setSelectedParticipant(null)}
          onSaved={handleRefresh}
        />
      )} */}
    </div>
  )
}
