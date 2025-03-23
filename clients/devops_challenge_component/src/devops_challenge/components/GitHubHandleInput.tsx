import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useCreateRepository } from '../pages/hooks/useCreateRepository'

export const GitHubHandleInput = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)

  const repositoryMutation = useCreateRepository(setError)
  const [handle, setHandle] = useState('')

  return (
    <div className='space-y-4'>
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Getting Started</AlertTitle>
        <AlertDescription>
          Enter your GitHub username to create a repository for this challenge.
        </AlertDescription>
      </Alert>

      <div className='flex space-x-2'>
        <div className='relative flex-1'>
          <Input
            placeholder='GitHub username'
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className='pl-9'
          />
        </div>
        <Button
          onClick={() => repositoryMutation.mutate(handle)}
          disabled={!handle || repositoryMutation.isPending}
          className='min-w-[120px]'
        >
          {repositoryMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating
            </>
          ) : (
            'Create'
          )}
        </Button>
      </div>
      {repositoryMutation.isError && error && (
        <Alert variant='destructive' className='mt-2'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {repositoryMutation.isSuccess && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Repository Created</AlertTitle>
          <AlertDescription>
            Your repository has been created. You can now start the challenge.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
