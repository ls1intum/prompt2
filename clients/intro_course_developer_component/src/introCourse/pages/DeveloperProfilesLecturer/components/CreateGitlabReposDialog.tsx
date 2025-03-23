import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ParticipationWithDevProfiles } from '../interfaces/pariticipationWithDevProfiles'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGitlabRepo } from '../../../network/mutations/createGitlabRepo'
import { useParams } from 'react-router-dom'
import { GitlabRepoRequest } from '../../../interfaces/GitlabRepoRequest'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { createIntroCourseGitlabInfrastructure } from '../../../network/mutations/createIntroCourseGitlabInfrastructure'
import { useGetCoursePhase } from '@/hooks/useGetCoursePhase'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'
import { Input } from '@/components/ui/input' // make sure you have an Input component

interface CreateGitlabReposDialogProps {
  participantsWithDevProfiles: ParticipationWithDevProfiles[]
}

export const CreateGitlabReposDialog = ({
  participantsWithDevProfiles,
}: CreateGitlabReposDialogProps): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isCreatingRepos, setIsCreatingRepos] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // State for storing the user-entered deadline
  const [deadline, setDeadline] = useState('')

  const { phaseId, courseId } = useParams<{ phaseId: string; courseId: string }>()
  const queryClient = useQueryClient()

  const { courses } = useCourseStore()
  const semesterTag = courses.find((course) => course.id === courseId)?.semesterTag ?? ''

  const { data: coursePhase, isPending, isError } = useGetCoursePhase()
  const { mutate: mutateCoursePhase } = useModifyCoursePhase(
    () => queryClient.invalidateQueries({ queryKey: ['course_phase', phaseId] }),
    () => setLogs((prev) => [...prev, `❌ Failed to update course phase`]),
  )

  const infraStructureExists: boolean =
    coursePhase?.restrictedData?.gitLabInfrastructureSetup ?? false

  const createGitlabRepoMutation = useMutation({
    mutationFn: ({
      coursePhaseParticipationID,
      createGitlabRepoDTO,
    }: {
      coursePhaseParticipationID: string
      createGitlabRepoDTO: GitlabRepoRequest
    }) => createGitlabRepo(phaseId ?? '', coursePhaseParticipationID, createGitlabRepoDTO),
  })

  const createInfrastructureSetup = useMutation({
    mutationFn: () => createIntroCourseGitlabInfrastructure(phaseId ?? '', { semesterTag }),
    onSuccess: () =>
      mutateCoursePhase({
        id: phaseId ?? '',
        restrictedData: { gitLabInfrastructureSetup: true },
      }),
    onError: (error) => setLogs((prev) => [...prev, `❌ Infrastructure setup error: ${error}`]),
  })

  const participationsReadyForGitlab = participantsWithDevProfiles.filter(
    (participation) =>
      participation.devProfile?.gitLabUsername && !participation.gitlabStatus?.gitlabSuccess,
  )

  const triggerCreateRepos = async () => {
    setIsCreatingRepos(true)
    setLogs([])
    setSuccessCount(0)
    setErrorCount(0)

    for (const participation of participationsReadyForGitlab) {
      try {
        await createGitlabRepoMutation.mutateAsync({
          coursePhaseParticipationID: participation.participation.courseParticipationID,
          createGitlabRepoDTO: {
            repoName: participation.participation.student.universityLogin ?? '', // use the TUM-ID as repository Name
            semesterTag,
            submissionDeadline: deadline, // Use the user-entered deadline here
          },
        })
        setSuccessCount((count) => count + 1)
        setLogs((preLogs) => [
          ...preLogs,
          `✅ Created repo for ${participation.devProfile?.gitLabUsername}`,
        ])
      } catch (error) {
        setErrorCount((count) => count + 1)
        setLogs((preLogs) => [
          ...preLogs,
          `❌ Failed to create repo for ${participation.devProfile?.gitLabUsername}: ${error}`,
        ])
      }
    }

    setIsCreatingRepos(false)
  }

  useEffect(() => {
    if (isDialogOpen) {
      setSuccessCount(0)
      setErrorCount(0)
      setLogs([])
      setDeadline('') // Reset the deadline field whenever the dialog opens
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
        <Button>Create Gitlab Repositories</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Gitlab Repositories</DialogTitle>
          <DialogDescription>
            Infrastructure setup and repo creation for students.
            <br />
            <strong>Important: </strong>Make sure that every student has a tutor assigned!
          </DialogDescription>
        </DialogHeader>

        <section className='flex items-center justify-between py-4 border-b'>
          <span>Infrastructure Setup</span>
          {infraStructureExists ? (
            <CheckCircle className='text-green-500' />
          ) : (
            <Button
              disabled={createInfrastructureSetup.isPending}
              onClick={() => createInfrastructureSetup.mutate()}
            >
              {createInfrastructureSetup.isPending
                ? 'Creating Infrastructure...'
                : 'Create Infrastructure'}
            </Button>
          )}
        </section>

        {/* Submission Deadline Field */}
        <section className='mt-4'>
          <div className='mb-2'>
            <label htmlFor='deadline' className='block text-sm font-medium'>
              Project Submission Deadline
            </label>
            <p className='text-xs text-muted-foreground'>
              Will be inserted as Submission Deadline in the Readme of the student repository.
            </p>
          </div>
          <Input
            id='deadline'
            placeholder='e.g. 2025-06-01 23:59'
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className='w-full mb-4'
          />

          <Button disabled={isCreatingRepos || !infraStructureExists} onClick={triggerCreateRepos}>
            Create Repositories ({participationsReadyForGitlab.length})
          </Button>

          {isCreatingRepos && (
            <Button variant='outline' className='ml-2' onClick={() => setIsCreatingRepos(false)}>
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
        </section>
      </DialogContent>
    </Dialog>
  )
}
