import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { AlertTriangle } from 'lucide-react'
import { ElementType } from 'react'

export interface MissingSettingsItem {
  title: string
  icon: ElementType
  description?: string
  hide?: () => void
}

interface MissingSettingsProps {
  elements: MissingSettingsItem[]
}

export const MissingSettings = ({ elements }: MissingSettingsProps): JSX.Element => {
  return (
    <>
      {elements.length > 0 && (
        <Card className='mb-6 border-l-4 border-l-yellow-400'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <AlertTriangle className='mr-2 text-yellow-500' />
              Missing Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {elements.map((config) => (
                <Alert key={config.title} className='flex items-start'>
                  <div className='flex-grow'>
                    <div className='flex items-center'>
                      <config.icon className='h-4 w-4 text-yellow-500 mr-2 mt-1' />
                      <div>
                        <AlertTitle className='mb-1'>Missing: {config.title}</AlertTitle>
                        <AlertDescription>
                          {config.description ||
                            `Please configure the ${config.title.toLowerCase()} to ensure proper functionality.`}
                        </AlertDescription>
                      </div>
                    </div>
                  </div>
                  {config.hide && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={config.hide}
                      className='ml-4 mt-1 whitespace-nowrap'
                    >
                      Hide Warning
                    </Button>
                  )}
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
