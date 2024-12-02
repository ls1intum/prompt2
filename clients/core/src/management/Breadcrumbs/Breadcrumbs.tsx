import React, { useMemo } from 'react'
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

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { courses } = useCourseStore()

  const breadcrumbList = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbProps[] = []

    if (pathSegments[0] === 'management') {
      if (pathSegments[1] === 'general') {
        breadcrumbs.push({ title: 'General', path: '/management/general' })
        pathSegments.slice(2).forEach((segment, index) => {
          breadcrumbs.push({
            title: segment.toUpperCase(),
            path: `/management/general/${pathSegments.slice(2, index + 3).join('/')}`,
          })
        })
      } else if (pathSegments[1] === 'course') {
        const courseId = pathSegments[2]
        const course = courses.find((c) => c.id === courseId)
        if (course) {
          breadcrumbs.push({ title: course.name, path: `/management/course/${courseId}` })

          const phaseId = pathSegments[4]
          const phase = course.course_phases.find((p) => p.id === phaseId)
          if (phase) {
            breadcrumbs.push({
              title: phase.name,
              path: `/management/course/${courseId}/${pathSegments[3]}/${phaseId}`,
            })
          }

          pathSegments.slice(5).forEach((segment, index) => {
            breadcrumbs.push({
              title: capitalizeFirstLetter(segment),
              path: `/management/course/${courseId}/${pathSegments.slice(3, index + 6).join('/')}`,
            })
          })
        }
      }
    }

    return breadcrumbs
  }, [location.pathname, courses])

  if (breadcrumbList.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbList.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbList.length - 1 ? (
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
