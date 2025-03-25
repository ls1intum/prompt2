import { useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, User } from 'lucide-react'
import { useCreateRepository } from '../pages/hooks/useCreateRepository'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export const GithubUsernameInput = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const repositoryMutation = useCreateRepository(setError)
  const [githubUsername, setGithubUsername] = useState('')
  const [hasGithubProfile, setHasGithubProfile] = useState(false)

  const validateGithubUsername = (username: string): boolean => {
    if (!/^[a-zA-Z0-9-]+$/.test(username) && username.length > 0) {
      setValidationError('GitHub username can only contain letters, numbers, and hyphens')
      return false
    }

    setValidationError(null)
    return true
  }

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setGithubUsername(newUsername)
    validateGithubUsername(newUsername)
  }

  const isInputValid = githubUsername.length > 0 && !validationError && hasGithubProfile

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='w-6 h-6' />
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
          <div className='space-y-2'>
            <div className='relative'>
              <Input
                placeholder='GitHub username'
                value={githubUsername}
                onChange={handleUsernameChange}
                className={`pl-10 ${validationError ? 'border-red-500' : ''}`}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'username-error' : undefined}
              />
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            </div>
            {validationError && (
              <p id='username-error' className='text-sm text-red-500'>
                {validationError}
              </p>
            )}
          </div>

          <div className='flex items-start space-x-2 mt-4'>
            <Checkbox
              id='github-profile-check'
              checked={hasGithubProfile}
              onCheckedChange={(checked) => setHasGithubProfile(checked as boolean)}
            />
            <label
              htmlFor='github-profile-check'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
            >
              I confirm that my GitHub account has my full name and a profile picture set up.
            </label>
          </div>

          <Button
            onClick={() => repositoryMutation.mutate(githubUsername)}
            disabled={!isInputValid || repositoryMutation.isPending}
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
