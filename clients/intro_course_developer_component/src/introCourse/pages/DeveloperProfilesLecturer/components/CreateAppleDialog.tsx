import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tumaet/prompt-ui-components'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ParticipationWithDevProfiles } from '../interfaces/pariticipationWithDevProfiles'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAppleAccount } from '../../../network/mutations/createAppleAccount'
import { useParams } from 'react-router-dom'
import { useGetCoursePhase } from '@/hooks/useGetCoursePhase'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'

interface CreateAppleAccountDialogProps {
  participantsWithDevProfiles: ParticipationWithDevProfiles[]
}

export const CreateAppleAccountDialog = ({
  participantsWithDevProfiles,
}: CreateAppleAccountDialogProps): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isCreatingAccounts, setIsCreatingAccounts] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  const { data: coursePhase, isPending, isError } = useGetCoursePhase()
  const { mutate: mutateCoursePhase } = useModifyCoursePhase(
    () => queryClient.invalidateQueries({ queryKey: ['course_phase', phaseId] }),
    () => setLogs((prev) => [...prev, `❌ Failed to update course phase`]),
  )

  const accountsExist: boolean = coursePhase?.restrictedData?.appleDeveloperAccountsSetup ?? false

  const createAppleAccountMutation = useMutation({
    mutationFn: ({ courseParticipationID }: { courseParticipationID: string }) =>
      createAppleAccount(phaseId ?? '', courseParticipationID),
    onSuccess: () =>
      mutateCoursePhase({
        id: phaseId ?? '',
        restrictedData: { appleDeveloperAccountsSetup: true },
      }),
    onError: (error) => setLogs((prev) => [...prev, `❌ Developer accounts setup error: ${error}`]),
  })

  const participationsReadyForApple = participantsWithDevProfiles

  // const participationsReadyForDevices = participantsWithDevProfiles.filter(
  //   (participation) =>
  //     participation.devProfile?.appleID && !participation.appleStatus?.appleSuccess,
  // )

  const triggerCreateAccounts = async () => {
    setIsCreatingAccounts(true)
    setLogs([])
    setSuccessCount(0)
    setErrorCount(0)

    for (const participation of participationsReadyForApple) {
      try {
        await createAppleAccountMutation.mutateAsync({
          courseParticipationID: participation.participation.courseParticipationID,
        })
        setSuccessCount((count) => count + 1)
        setLogs((preLogs) => [
          ...preLogs,
          `✅ Created account for ${participation.devProfile?.appleID}`,
        ])
      } catch (error) {
        setErrorCount((count) => count + 1)
        setLogs((preLogs) => [
          ...preLogs,
          `❌ Failed to create account for ${participation.devProfile?.appleID}: ${error}`,
        ])
      }
    }

    setIsCreatingAccounts(false)
  }

  useEffect(() => {
    if (isDialogOpen) {
      setSuccessCount(0)
      setErrorCount(0)
      setLogs([])
    }
  }, [isDialogOpen])

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center h-64 text-red-600'>
        <AlertCircle className='h-12 w-12 mr-2' /> Failed to load course phase data.
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Create Apple Accounts</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Apple Accounts</DialogTitle>
          <DialogDescription>Apple developer account creation for students.</DialogDescription>
        </DialogHeader>

        <section className='flex items-center justify-between py-4 border-b'>
          <span>Create Apple Developer Accounts</span>
          {accountsExist ? (
            <CheckCircle className='text-green-500' />
          ) : (
            <Button
              disabled={createAppleAccountMutation.isPending}
              onClick={() => triggerCreateAccounts()}
            >
              {createAppleAccountMutation.isPending ? 'Creating Accounts...' : 'Create Accounts'}
            </Button>
          )}
        </section>

        {isCreatingAccounts && (
          <Button variant='outline' className='ml-2' onClick={() => setIsCreatingAccounts(false)}>
            Cancel
          </Button>
        )}

        <div className='mt-4 max-h-40 overflow-auto border rounded p-2 text-xs'>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>

        {(successCount > 0 || errorCount > 0) && (
          <div className='mt-2'>
            <span className='text-green-600'>Success: {successCount}</span>
            <span className='ml-4 text-red-600'>Failed: {errorCount}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
