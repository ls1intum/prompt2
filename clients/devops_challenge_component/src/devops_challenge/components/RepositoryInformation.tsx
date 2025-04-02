import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, ExternalLink, Clipboard, Check } from 'lucide-react'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'
import { Button } from '@/components/ui/button'

export const RepositoryInformation = (): JSX.Element => {
  const developerQuery = useGetDeveloperProfile()
  const repoUrl = developerQuery.data?.repositoryUrl || ''

  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(repoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl flex items-center'>
          <Github className='mr-2 h-5 w-5' />
          Repository Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex flex-col space-y-1'>
            <p>We have created a repository for you. Only you have access. You must solve this challenge independently! No collaboration with other students is allowed. You may use GenAI tools such as Github Co-Pilot or ChatGPT, but make sure that you understand what you are doing! Open the GitHub repository using the link below and carefully read the Challenge Description in the README. Clone the repository, solve the challenge, then commit and push your changes. When you think you have successfully solved the challenge, click on Start Testing. You have at most 3 attempts to test your solution, so use them wisely.</p>
            <span className='text-sm text-muted-foreground'>Repository URL</span>
            <div className='flex items-center gap-2'>
              <div className='flex-1 flex items-center'>
                <a
                  href={repoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline mr-1 truncate'
                >
                  {repoUrl}
                </a>
                <ExternalLink className='h-3 w-3 flex-shrink-0' />
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full'
                onClick={copyToClipboard}
                title='Copy Repository URL'
                aria-label='Copy Repository URL'
              >
                {copied ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Clipboard className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
