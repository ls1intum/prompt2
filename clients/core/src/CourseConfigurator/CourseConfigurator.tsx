import { Canvas } from './Canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorPage } from '@/components/ErrorPage'
import { Loader2 } from 'lucide-react'
import { useCourseConfiguratorDataSetup } from './handlers/useCourseConfiguratorDataSetup'

export default function CourseConfiguratorPage() {
  const { courseId, isError, isPending, error, finishedSetup, refetchAll } =
    useCourseConfiguratorDataSetup()

  return (
    <>
      <Card className='m-8' key={courseId}>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>Follow these steps to create your course flow:</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className='list-decimal list-inside space-y-2'>
            <li>Drag course phases from the sidebar onto the canvas</li>
            <li>Connect phases by dragging from one node&apos;s handle to another</li>
            <li>Edit phase details by clicking the &quot;Edit&quot; button on each node</li>
            <li>Arrange your nodes to create a logical course flow</li>
          </ol>
        </CardContent>
      </Card>

      <Card className='m-8'>
        {isError ? (
          <ErrorPage
            title='Error'
            description='Failed to fetch course phase types'
            message={error?.message}
            onRetry={() => {
              refetchAll()
            }}
          />
        ) : isPending || !finishedSetup ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
          </div>
        ) : (
          <Canvas />
        )}
      </Card>
    </>
  )
}
