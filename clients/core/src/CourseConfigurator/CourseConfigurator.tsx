import { CourseConfigurator } from './components/course-configurator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CourseConfiguratorPage() {
  return (
    <div className='min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>Course Configurator</h1>
          <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4'>
            Design your course flow by connecting different phases
          </p>
        </div>
        <Card className='mb-8'>
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
        <div className='bg-white shadow-lg rounded-lg overflow-hidden' style={{ height: '70vh' }}>
          <CourseConfigurator />
        </div>
      </div>
    </div>
  )
}
