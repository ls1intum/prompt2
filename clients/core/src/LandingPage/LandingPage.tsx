import { AlertCircle, Loader2 } from 'lucide-react'
import { Header } from './components/Header'
import { CourseCard } from './components/CourseCard'
import { Footer } from './components/Footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useQuery } from '@tanstack/react-query'
import { getAllCourses } from '../network/queries/course'
import { Course } from '@/interfaces/course'

export function LandingPage(): JSX.Element {
  const {
    data: courses,
    isPending,
    isError,
  } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => getAllCourses(),
  })

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <main className='flex-grow w-full px-4 sm:px-6 lg:px-8 py-12'>
        <div className='max-w-[1400px] mx-auto'>
          <Header />

          <section className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-4'>
              Course Application Portal
            </h2>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto mb-8'>
              Welcome to the TUM Research Group for Applied Education Technologies&apos; official
              platform for course and seminar applications.
            </p>
          </section>

          <section className='mb-16'>
            <h3 className='text-2xl font-semibold text-gray-800 mb-6'>Available Courses</h3>
            {isPending ? (
              <div className='flex justify-center items-center h-64'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : isError ? (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An error occurred while fetching courses. Please try again later.
                </AlertDescription>
              </Alert>
            ) : courses && courses.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>No Open Applications</AlertTitle>
                <AlertDescription>
                  No applications are currently open. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
