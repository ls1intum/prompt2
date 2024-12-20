import { useCourseStore } from '@/zustand/useCourseStore'
import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { TemplateRoutes } from './ExternalRouters/TemplateRoutes'
import { ApplicationRoutes } from './ExternalRouters/ApplicationRoutes'

const PhaseRouter: { [key: string]: React.FC } = {
  template_component: TemplateRoutes,
  Application: ApplicationRoutes,
}

export const PhaseRouterMapping = (): JSX.Element => {
  const phaseId = useParams<{ phaseId: string }>().phaseId
  const courseId = useParams<{ courseId: string }>().courseId
  const { courses } = useCourseStore()

  const selectedPhase = courses
    .find((c) => c.id === courseId)
    ?.course_phases.find((p) => p.id === phaseId)

  if (!selectedPhase) {
    return <div>Phase not found</div>
  }

  const PhaseComponent = PhaseRouter[selectedPhase.course_phase_type]

  if (!PhaseComponent) {
    return <div>Phase Module not found</div>
  }

  return (
    <Suspense fallback={<div>Fallback</div>}>
      <PhaseComponent />
    </Suspense>
  )
}
