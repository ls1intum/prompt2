import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export const OverviewPage = (): JSX.Element => {
  const path = useLocation().pathname

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Construction className='h-6 w-6 text-yellow-500' />
            <CardTitle className='text-2xl'>Assessment Component</CardTitle>
          </div>
          <Badge variant='secondary' className='bg-yellow-200 text-yellow-800'>
            Currently in Development
          </Badge>
        </div>
        <CardDescription>This component is currently under development</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='p-4 border-2 border-dashed border-gray-300 rounded-lg'>
          You are currently at {path}
        </div>
      </CardContent>
    </Card>
  )
}

export default OverviewPage
