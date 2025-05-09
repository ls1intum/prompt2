import { Card, CardDescription, CardHeader, CardTitle } from '@tumaet/prompt-ui-components'

export const WelcomePage = () => {
  return (
    <div className='flex w-full h-full items-center justify-center p-4'>
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>
            <img
              src='/prompt_logo.svg'
              alt='Prompt Logo'
              width='120'
              height='120'
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            Welcome to the PROMPT Management Dashboard
          </CardTitle>
          <CardDescription>Select an option from the sidebar to get started</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
