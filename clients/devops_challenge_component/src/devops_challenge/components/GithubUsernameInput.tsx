import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, Github } from 'lucide-react'
import { useCreateRepository } from '../pages/hooks/useCreateRepository'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const GithubUsernameInput = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const repositoryMutation = useCreateRepository(setError)
  const [handle, setHandle] = useState('')

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Github className='w-6 h-6' />
          GitHub Repository Setup
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Alert className='bg-black-50 border-black-200'>
          <AlertCircle className='h-4 w-4 text-black-600' />
          <AlertTitle className='text-black-800'>Getting Started</AlertTitle>
          <AlertDescription className='text-black-700'>
            Enter your GitHub username to create a repository for this challenge.
          </AlertDescription>
        </Alert>

        <div className='space-y-4'>
          <div className='relative'>
            <Input
              placeholder='GitHub username'
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className='pl-10'
            />
            <Github className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          </div>
          <Button
            onClick={() => repositoryMutation.mutate(handle)}
            disabled={!handle || repositoryMutation.isPending}
            className='w-full'
          >
            {repositoryMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Repository
              </>
            ) : (
              'Create Repository'
            )}
          </Button>
        </div>

        {repositoryMutation.isError && error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {repositoryMutation.isSuccess && (
          <Alert className='bg-green-50 border-green-200'>
            <AlertCircle className='h-4 w-4 text-green-600' />
            <AlertTitle className='text-green-800'>Repository Created</AlertTitle>
            <AlertDescription className='text-green-700'>
              Your repository has been created successfully. You can now start the challenge.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
