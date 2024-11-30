import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/zustand/useCourseStore'

interface BreadcrumbProps {
  title: string
  path: string
}

export const Breadcrumbs = (): JSX.Element => {
  const location = useLocation()
  const pathName = location.pathname
  const { courses } = useCourseStore()

  const breadcrumbs: BreadcrumbProps[] = []

  if (location.pathname.startsWith('/management/general')) {
    breadcrumbs.push({ title: 'General', path: '/management/general' })
    pathName
      .split('/')
      .slice(3)
      .forEach((path, index) => {
        breadcrumbs.push({
          title: path.toUpperCase(),
          path: pathName
            .split('/')
            .slice(0, 3 + index)
            .join('/'),
        })
      })
  } else if (location.pathname.startsWith('/management/course')) {
    let remainingPathName = pathName.split('/').slice(3) // remove '/management/course'
    if (remainingPathName.length > 0) {
      const courseId = remainingPathName[0]
      const course = courses.find((c) => c.id === courseId)
      if (course) {
        breadcrumbs.push({ title: course.name, path: `/management/course/${courseId}/` })
      }

      remainingPathName = remainingPathName.slice(1) // expecting /phaseName/:phaseId
      if (remainingPathName.length > 0) {
        const phaseId = remainingPathName[1]
        const phase = course?.course_phases.find((p) => p.id === phaseId)
        if (phase) {
          breadcrumbs.push({
            title: phase.name,
            path: `/management/course/${courseId}/${remainingPathName[0]}/${phaseId}/`,
          })
        }

        // all remaining paths should be straightforward
        remainingPathName.slice(2).forEach((path, index) => {
          if (path.length > 0) {
            breadcrumbs.push({
              title: path.charAt(0).toUpperCase() + path.slice(1),
              path: pathName
                .split('/')
                .slice(0, 7 + index)
                .join('/'),
            })
          }
        })
      }
    }
  }

  console.log(breadcrumbs)
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink onClick={() => navigate(crumb.path)}>{crumb.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
