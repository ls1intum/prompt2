import { SidebarMenu } from '@/components/ui/sidebar'
import { FileUser, Gauge, Settings } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'
import { TemplateSidebar } from '../../Router/TemplateSidebar'
import { Suspense, useMemo } from 'react'
import { useCourseStore } from '@/zustand/useCourseStore'
import { DisabledSidebarMenuItem } from './components/DisabledSidebarMenuItem'

const PhaseMapping: { [key: string]: React.FC<{ baseRoot: string; title: string }> } = {
  template_component: TemplateSidebar,
}

export const InsideCourseSidebar = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()

  const rootPath = `/management/course/${courseId}/`

  const { sortedPhases } = useMemo(() => {
    const activeCourse = courses.find((c) => c.id === courseId)
    const phasesSorted =
      activeCourse?.course_phases
        .filter((phase) => phase.sequence_order !== -1) // filter out the ones without sequence order
        .sort((a, b) => a.sequence_order - b.sequence_order) || []
    return { sortedPhases: phasesSorted }
  }, [courseId, courses])

  return (
    <SidebarMenu>
      <InsideSidebarMenuItem goToPath={rootPath} icon={<Gauge />} title='Overview' />
      {sortedPhases.map((phase) => {
        if (phase.course_phase_type === 'application') {
          return (
            <InsideSidebarMenuItem
              key={phase.id}
              goToPath={rootPath + 'application/' + phase.id}
              icon={<FileUser />}
              title={phase.name}
            />
          )
        } else if (phase.course_phase_type in PhaseMapping) {
          const PhaseComponent = PhaseMapping[phase.course_phase_type]
          return (
            <Suspense key={phase.id} fallback={<div>Loading module...</div>}>
              <PhaseComponent
                baseRoot={rootPath + phase.course_phase_type + '/' + phase.id}
                title={phase.name}
              />
            </Suspense>
          )
        } else {
          return <DisabledSidebarMenuItem key={phase.id} title={'Unknown' + phase.name} />
        }
      })}

      {/** TODO: add submodules here */}
      <InsideSidebarMenuItem
        goToPath={rootPath + 'settings'}
        icon={<Settings />}
        title='Settings'
        subitems={[
          {
            goToPath: rootPath + 'modules/1',
            title: 'Module 1',
          },
          {
            goToPath: rootPath + 'modules/2',
            title: 'Module 2',
          },
        ]}
      />
    </SidebarMenu>
  )
}
