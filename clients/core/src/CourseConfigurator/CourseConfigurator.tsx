import { Canvas } from './Canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CourseConfiguratorPage() {
  return (
    <>
      <Card className='m-8'>
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
        <Canvas />
      </Card>
    </>
  )
}
