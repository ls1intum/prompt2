import { useKeycloak } from '@/keycloak/useKeycloak'
import { useAuthStore } from '@/zustand/useAuthStore'
import UnauthorizedPage from './components/UnauthorizedPage'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '../Sidebar/AppSidebar'
import { WelcomePage } from './components/WelcomePage'
import { LoadingPage } from '@/components/LoadingPage'
import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Course } from '@/interfaces/course'
import { getAllCourses } from '../network/queries/course'
import { useCourseStore } from '@/zustand/useCourseStore'
import { ErrorPage } from '@/components/ErrorPage'
import { Separator } from '@/components/ui/separator'
import DarkModeProvider from '@/contexts/DarkModeProvider'
import { useParams } from 'react-router-dom'
import CourseNotFound from './components/CourseNotFound'
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs'

export const ManagementRoot = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const { keycloak, logout } = useKeycloak()
  const { user, permissions } = useAuthStore()
  const courseId = useParams<{ courseId: string }>()
  const hasChildren = React.Children.count(children) > 0

  const { setCourses } = useCourseStore()

  // getting the courses
  const {
    data: fetchedCourses,
    error,
    isPending,
    isError,
    refetch,
  } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => getAllCourses(),
  })

  const isLoading = !(keycloak && user) || isPending

  useEffect(() => {
    if (fetchedCourses) {
      setCourses(fetchedCourses)
    }
  }, [fetchedCourses, setCourses])

  if (isLoading) {
    return <LoadingPage />
  }

  if (isError) {
    console.error(error)
    return <ErrorPage onRetry={() => refetch()} onLogout={() => logout()} />
  }

  // Check if the user has at least some Prompt rights
  if (permissions.length === 0) {
    return <UnauthorizedPage />
  }

  // TODO: when calling /management -> check for course in local storage, else redirect to /management/general

  // TODO do course id management here
  // store latest selected course in local storage

  const courseExists = fetchedCourses.some((course) => course.id === courseId.courseId)

  return (
    <DarkModeProvider>
      <SidebarProvider>
        <AppSidebar onLogout={() => logout()} />
        <SidebarInset>
          {courseId.courseId && !courseExists && (
            <CourseNotFound courseId={courseId.courseId || ''} />
          )}
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumbs />
            </div>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            {hasChildren ? children : <WelcomePage />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DarkModeProvider>
  )
}
