import React, { useMemo } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@tumaet/prompt-ui-components'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCourseStore } from '@tumaet/prompt-shared-state'

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
      } else if (pathSegments[1] === 'course' && pathSegments.length >= 3) {
        const courseId = pathSegments[2]
        const course = courses.find((c) => c.id === courseId)
        if (course) {
          breadcrumbs.push({ title: course.name, path: `/management/course/${courseId}` })

          if (pathSegments.length >= 3 && pathSegments[3] === 'configurator') {
            breadcrumbs.push({
              title: 'Course Configurator',
              path: `/management/course/${courseId}/configurator`,
            })
          } else if (pathSegments.length >= 3) {
            const phaseId = pathSegments[3]
            const phase = course.coursePhases.find((p) => p.id === phaseId)
            if (phase) {
              breadcrumbs.push({
                title: phase.name,
                path: `/management/course/${courseId}/${phaseId}`,
              })
            }
            pathSegments.slice(4).forEach((segment, index) => {
              // TODO: this might require a more sophisticated process in the future!
              // we assume that longer items are ids
              if (segment.length < 20) {
                breadcrumbs.push({
                  title: capitalizeFirstLetter(segment),
                  path: `/management/course/${courseId}/${phaseId}/${pathSegments.slice(4, index + 5).join('/')}`,
                })
              }
            })
          }
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
                <BreadcrumbLink style={{ cursor: 'pointer' }} onClick={() => navigate(crumb.path)}>
                  {crumb.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
