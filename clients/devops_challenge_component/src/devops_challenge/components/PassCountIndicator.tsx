import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export const PassCountIndicator = (): JSX.Element => {


  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl flex items-center'>
          <Trophy className='mr-2 h-5 w-5' />
          Students Passed Count
        </CardTitle>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  )
}
