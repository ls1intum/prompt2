import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Users, AlertCircle } from 'lucide-react'
import { useGetPassedStudentsCount } from '../pages/hooks/useGetPassedStudents'
import type { JSX } from 'react'

export const PassCountIndicator = (): JSX.Element => {
  const passedCountQuery = useGetPassedStudentsCount()

  const passedCount = passedCountQuery.data ?? 0

  const isLoading = passedCountQuery.isLoading
  const isError = passedCountQuery.isError

  return (
    <Card className='overflow-hidden border-2'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl flex items-center justify-between'>
          <div className='flex items-center'>
            <Trophy className='mr-2 h-5 w-5 text-amber-500' />
            <span>Challenge Status</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-muted-foreground'>Students who already passed the challenge</span>
          <div className='flex items-center gap-2'>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                <span className='text-muted-foreground'>Loading...</span>
              </div>
            ) : isError ? (
              <div className='flex items-center gap-2 text-red-500'>
                <AlertCircle className='h-4 w-4' />
                <span>Error fetching data</span>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-primary' />
                <span className='text-2xl font-bold'>{passedCount}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
