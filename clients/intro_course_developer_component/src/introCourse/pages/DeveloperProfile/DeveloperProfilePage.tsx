import { DeveloperProfileForm } from './DeveloperProfileForm'
import { useIntroCourseStore } from '../../zustand/useIntroCourseStore'
import { useState } from 'react'
import { Button } from '@tumaet/prompt-ui-components'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postDeveloperProfile } from '../../network/mutations/postDeveloperProfile'
import { useParams } from 'react-router-dom'
import { PostDeveloperProfile } from '../../interfaces/PostDeveloperProfile'

interface DeveloperProfilePageProps {
  onContinue: () => void
}

export const DeveloperProfilePage = ({ onContinue }: DeveloperProfilePageProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { developerProfile } = useIntroCourseStore()
  const [currState, setCurrState] = useState<'input' | 'success' | 'error'>(
    developerProfile === undefined ? 'input' : 'success',
  )

  const mutation = useMutation({
    mutationFn: (devProfile: PostDeveloperProfile) => {
      return postDeveloperProfile(phaseId ?? '', devProfile)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer_profile'] })
      setCurrState('success')
    },
    onError: () => {
      setCurrState('error')
    },
  })

  return (
    <div>
      {currState === 'input' && (
        <DeveloperProfileForm
          developerProfile={developerProfile}
          onSubmit={(profile) => {
            mutation.mutate(profile)
          }}
        />
      )}
      {currState === 'success' && (
        <div className='flex items-center justify-center min-h-[300px]'>
          {currState === 'success' && (
            <div className='text-center space-y-4'>
              <div className='flex flex-col items-center space-y-2 text-green-500'>
                <CheckCircle className='h-12 w-12' />
                <h2 className='text-2xl font-semibold'>Success</h2>
              </div>
              <p className='text-muted-foreground max-w-md mx-auto'>
                You have successfully submitted your developer profile.
              </p>
              <div className='pt-4'>
                <Button onClick={onContinue}>Continue to the next step</Button>
              </div>
            </div>
          )}
        </div>
      )}
      {currState === 'error' && (
        <div className='text-center space-y-4'>
          <div className='flex flex-col items-center space-y-2 text-red-600'>
            <AlertCircle className='h-12 w-12' />
            <h2 className='text-2xl font-semibold'>Error</h2>
          </div>
          <p className='text-muted-foreground max-w-md mx-auto'>
            Something went wrong. Please try again later or contact support.
          </p>
          <div className='flex space-x-4 pt-4 max-w-md mx-auto'>
            <Button onClick={() => setCurrState('input')} variant='outline' className='flex-1'>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
