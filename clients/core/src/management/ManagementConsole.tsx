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
import { getAllCourses } from '@/network/course'
import { useCourseStore } from '@/zustand/useCourseStore'
import { ErrorPage } from '@/components/ErrorPage'
import { NoCourseSelectedPage } from './components/NoCourseSelectedPage'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import DarkModeProvider from '@/contexts/DarkModeProvider'

export const ManagementRoot = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const { keycloak, logout } = useKeycloak()
  const { user, permissions } = useAuthStore()
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
    return <ErrorPage onRetry={() => refetch()} onLogout={logout} />
  }

  // TODO update with what was passed to this page
  if (permissions.length === 0) {
    return <UnauthorizedPage />
  }

  return (
    <DarkModeProvider>
      <SidebarProvider>
        <AppSidebar onLogout={logout} />
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>
                    <BreadcrumbLink href='#'>Building Your Application</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {hasChildren ? children : <WelcomePage />}
        </SidebarInset>
      </SidebarProvider>
    </DarkModeProvider>
  )
}
