import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink } from 'lucide-react'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'

export const RepositoryInformation = (): JSX.Element => {
  const developerQuery = useGetDeveloperProfile()
  const remainingAttempts = Math.max(
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0),
    0,
  )

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl flex items-center'>
          <Github className='mr-2 h-5 w-5' />
          Repository Information
          <div className='flex items-center space-x-2 ml-auto'>
            <Badge
              variant='outline'
              className={`text-sm ${
                remainingAttempts >= 3
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : remainingAttempts === 2
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              Remaining Attempts: {remainingAttempts}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex flex-col space-y-1'>
            <span className='text-sm text-muted-foreground'>Repository URL</span>
            <a
              href={developerQuery.data?.repositoryUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary flex items-center hover:underline'
            >
              {developerQuery.data?.repositoryUrl}
              <ExternalLink className='ml-1 h-3 w-3' />
            </a>
          </div>

          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <Badge
                variant='outline'
                className={
                  developerQuery.data?.hasPassed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
              >
                {developerQuery.data?.hasPassed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
