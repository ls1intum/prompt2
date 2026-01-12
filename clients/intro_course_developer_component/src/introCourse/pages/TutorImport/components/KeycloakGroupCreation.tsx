import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, CardContent } from '@tumaet/prompt-ui-components'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'
import { createCustomKeycloakGroup } from '../../../network/mutations/createCustomKeycloakGroup'
import { CreateKeycloakGroup } from '../../../interfaces/CreateKeycloakGroup'
import { CoursePhaseWithMetaData, UpdateCoursePhase } from '@tumaet/prompt-shared-state'

const KEYCLOAK_GROUP_NAME = 'introCourseTutors'

interface KeycloakGroupCreationProps {
  coursePhase: CoursePhaseWithMetaData
}

export function KeycloakGroupCreation({ coursePhase }: KeycloakGroupCreationProps) {
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const [groupExists, setGroupExists] = useState<boolean | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (coursePhase) {
      setGroupExists(!!coursePhase.restrictedData?.keycloakGroup)
    }
  }, [coursePhase])

  const { mutate: modifyCoursePhase } = useModifyCoursePhase(
    () => {
      setIsCreating(false)
      setGroupExists(true)
    },
    () => {
      setIsCreating(false)
      setError('Failed to create Keycloak group - Please try again later')
    },
  )

  const { mutate: createGroup } = useMutation({
    mutationFn: (group: CreateKeycloakGroup) => createCustomKeycloakGroup(courseId ?? '', group),
    onSuccess: () => {
      modifyCoursePhase({
        id: phaseId,
        restrictedData: { keycloakGroup: KEYCLOAK_GROUP_NAME },
      } as UpdateCoursePhase)
    },
    onError: () => {
      setIsCreating(false)
      setError('Failed to create Keycloak group')
    },
  })

  const handleCreateGroup = () => {
    setIsCreating(true)
    setError(undefined)
    createGroup({ GroupName: KEYCLOAK_GROUP_NAME })
  }

  const statusIcon =
    groupExists === undefined ? (
      <div className='h-6 w-6 rounded-full bg-muted' />
    ) : groupExists ? (
      <CheckCircle2 className='h-6 w-6 mr-2 text-green-500' />
    ) : (
      <AlertCircle className='h-6 w-6 mr-2 text-amber-500' />
    )

  const statusText =
    groupExists === undefined
      ? 'Checking Keycloak group status...'
      : groupExists
        ? 'Keycloak group has been created'
        : 'Keycloak group does not exist'

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {statusIcon}
            <div>
              <h3 className='font-medium'>{statusText}</h3>
              {groupExists === false && (
                <p className='text-sm text-muted-foreground'>
                  Create a Keycloak group to manage tutor permissions
                </p>
              )}
              {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
            </div>
          </div>
          {groupExists === false && (
            <Button onClick={handleCreateGroup} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Keycloak Group'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
