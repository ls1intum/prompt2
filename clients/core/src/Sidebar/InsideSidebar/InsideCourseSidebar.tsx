import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { Gauge } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'
import { Suspense, useMemo } from 'react'
import { useCourseStore } from '@/zustand/useCourseStore'
import { DisabledSidebarMenuItem } from './components/DisabledSidebarMenuItem'
import { PhaseSidebarMapping } from '../../PhaseMapping/PhaseSidebarMapping'
import { CourseConfiguratorSidebar } from '../../PhaseMapping/ExternalSidebars/CourseConfiguratorSidebar'

export const InsideCourseSidebar = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()

  const rootPath = `/management/course/${courseId}`

  const { sortedPhases } = useMemo(() => {
    const activeCourse = courses.find((c) => c.id === courseId)
    const phasesSorted =
      activeCourse?.course_phases
        .filter((phase) => phase.sequence_order !== -1) // filter out the ones without sequence order
        .sort((a, b) => a.sequence_order - b.sequence_order) || []
    return { sortedPhases: phasesSorted }
  }, [courseId, courses])

  return (
    <SidebarMenu className='space-y-4'>
      <SidebarGroup>
        <SidebarGroupContent>
          <InsideSidebarMenuItem goToPath={rootPath} icon={<Gauge />} title='Overview' />
          <CourseConfiguratorSidebar rootPath={rootPath} title='Configure Course' />
        </SidebarGroupContent>
      </SidebarGroup>

      {sortedPhases.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Course Phases</SidebarGroupLabel>
          <SidebarGroupContent>
            {sortedPhases.map((phase) => {
              if (phase.course_phase_type in PhaseSidebarMapping) {
                const PhaseComponent = PhaseSidebarMapping[phase.course_phase_type]
                return (
                  <Suspense
                    key={phase.id}
                    fallback={<DisabledSidebarMenuItem key={phase.id} title={'Loading...'} />}
                  >
                    <PhaseComponent rootPath={rootPath + '/' + phase.id} title={phase.name} />
                  </Suspense>
                )
              } else {
                return <DisabledSidebarMenuItem key={phase.id} title={'Unknown ' + phase.name} />
              }
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarMenu>
  )
}
