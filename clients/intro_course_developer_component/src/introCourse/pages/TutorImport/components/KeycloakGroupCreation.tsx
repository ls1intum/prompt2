import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useGetCoursePhase } from '@/hooks/useGetCoursePhase'
import { ErrorPage } from '@/components/ErrorPage'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'
import { UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createCustomKeycloakGroup } from '../../../network/mutations/createCustomKeycloakGroup'
import { CreateKeycloakGroup } from '../../../interfaces/CreateKeycloakGroup'

const KEYCLOAK_GROUP_NAME = 'introCourseTutors'

export function KeycloakGroupCreation() {
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const [groupExists, setGroupExists] = useState<boolean | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  // get current course phase
  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch: refetchCoursePhase,
  } = useGetCoursePhase()

  const { mutate: mutateCoursePhase } = useModifyCoursePhase(
    () => {
      setIsCreating(false)
      setGroupExists(true)
    },
    () => {
      setIsCreating(false)
      setError('Failed to create Keycloak group - Please try again later')
    },
  )

  const { mutate: mutateCreateGroup } = useMutation({
    mutationFn: (group: CreateKeycloakGroup) => {
      return createCustomKeycloakGroup(courseId ?? '', group)
    },
    onSuccess: () => {
      // on success, store the group in the core
      // store the name in the core
      mutateCoursePhase({
        id: phaseId,
        restrictedData: {
          keycloakGroup: KEYCLOAK_GROUP_NAME,
        },
      } as UpdateCoursePhase)
    },
    onError: () => {
      setIsCreating(false)
      setError('Failed to create Keycloak group')
    },
  })

  useEffect(() => {
    if (fetchedCoursePhase) {
      if (fetchedCoursePhase.restrictedData?.keycloakGroup) {
        setGroupExists(true)
      } else {
        setGroupExists(false)
      }
    }
  }, [fetchedCoursePhase])

  if (isCoursePhasePending) {
    return (
      <div className='flex justify-center items-center flex-grow'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isCoursePhaseError) {
    return <ErrorPage onRetry={refetchCoursePhase} />
  }

  const handleCreateGroup = async () => {
    setIsCreating(true)
    setError(undefined)

    // create the keycloak Group
    mutateCreateGroup({
      GroupName: KEYCLOAK_GROUP_NAME,
    })
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {groupExists === null ? (
              <div className='h-6 w-6 rounded-full bg-muted' />
            ) : groupExists ? (
              <CheckCircle2 className='h-6 w-6 ml-2 text-green-500' />
            ) : (
              <AlertCircle className='h-6 w-6 ml-2 text-amber-500' />
            )}

            <div>
              <h3 className='font-medium'>
                {groupExists === null
                  ? 'Checking Keycloak group status...'
                  : groupExists
                    ? 'Keycloak group exists'
                    : 'Keycloak group does not exist'}
              </h3>
              {!groupExists && groupExists !== null && (
                <p className='text-sm text-muted-foreground'>
                  Create a Keycloak group to manage tutor permissions
                </p>
              )}
              {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
            </div>
          </div>

          {!groupExists && groupExists !== null && (
            <Button onClick={handleCreateGroup} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Keycloak Group'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
