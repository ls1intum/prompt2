import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@tumaet/prompt-ui-components'
import { FileUser, GalleryVerticalEnd, NotepadText } from 'lucide-react'
import { ReactNode } from 'react'

interface StudentDetailContentProps {
  courseEnrollment: ReactNode
  applicationViews: ReactNode
}

interface SideBySideViewProps extends StudentDetailContentProps {
  className?: string
}

interface TabViewProps extends StudentDetailContentProps {
  className?: string
}

function CourseEnrollmentDescriptor() {
  return (
    <div className='flex gap-1'>
      <GalleryVerticalEnd className='w-5 h-5' />
      Course Progression
    </div>
  )
}

function ApplicationViewsDescriptor() {
  return (
    <div className='flex gap-1'>
      <FileUser className='w-5 h-5' />
      Application
    </div>
  )
}

function SideBySideView({
  applicationViews,
  courseEnrollment,
  className = '',
}: SideBySideViewProps) {
  return (
    <div className={`grid grid-cols-2 mt-4 ${className}`}>
      <div className=' lg:pr-2 xl:pr-4'>{applicationViews}</div>
      <div>{courseEnrollment}</div>
    </div>
  )
}

function TabView({ applicationViews, courseEnrollment, className = '' }: TabViewProps) {
  return (
    <div className={className}>
      <Tabs defaultValue='applicationViews'>
        <TabsList className='w-full'>
          <TabsTrigger value='applicationViews' className='flex-1'>
            <ApplicationViewsDescriptor />
          </TabsTrigger>
          <TabsTrigger value='courseEnrollment' className='flex-1'>
            <CourseEnrollmentDescriptor />
          </TabsTrigger>
        </TabsList>
        <TabsContent value='applicationViews'>{applicationViews}</TabsContent>
        <TabsContent value='courseEnrollment'>{courseEnrollment}</TabsContent>
      </Tabs>
    </div>
  )
}

export function ApplicationDetailPageLayout({
  applicationViews,
  courseEnrollment,
}: StudentDetailContentProps) {
  return (
    <>
      <TabView
        className='lg:hidden'
        applicationViews={applicationViews}
        courseEnrollment={courseEnrollment}
      />
      <SideBySideView
        className='hidden lg:grid'
        applicationViews={applicationViews}
        courseEnrollment={courseEnrollment}
      />
    </>
  )
}
