import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Construction } from 'lucide-react'
import { useParams } from 'react-router-dom'

export const ApplicationForm = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Construction className='h-6 w-6 text-yellow-500' />
            <CardTitle className='text-2xl'>ApplicationForm</CardTitle>
          </div>
          <Badge variant='secondary' className='bg-yellow-200 text-yellow-800'>
            In Development
          </Badge>
        </div>
        <CardDescription>This component is currently under development</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='p-4 border-2 border-dashed border-gray-300 rounded-lg'>
          {/* Empty space for future component content */}
          Currently trying to access the application with phaseId: {phaseId}
        </div>
      </CardContent>
    </Card>
  )
}
