import { CardTitle } from '@/components/ui/card'
import { CoursePhaseWithPosition } from '@core/managementConsole/courseConfigurator/interfaces/coursePhaseWithPosition'
import { useCourseConfigurationState } from '@core/managementConsole/courseConfigurator/zustand/useCourseConfigurationStore'
import { Pen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getPermissionString,
  Role,
  useAuthStore,
  useCourseStore,
} from '@tumaet/prompt-shared-state'

interface NameEditingHeaderProps {
  phaseID: string
}

export const NameEditingHeader = ({ phaseID }: NameEditingHeaderProps): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  const canEdit = permissions.includes(
    getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semesterTag),
  )

  const { coursePhases, setCoursePhases } = useCourseConfigurationState()
  const coursePhase = coursePhases.find((phase) => phase.id === phaseID)
  const [nameInput, setNameInput] = useState(coursePhase?.name)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    if (coursePhase?.name !== nameInput) {
      setCoursePhases(
        coursePhases.map((phase) => {
          if (phase.id === phaseID) {
            return { ...phase, name: nameInput, isModified: true } as CoursePhaseWithPosition
          }
          return phase
        }),
      )
    }

    setIsEditing(false)
  }

  return (
    <div className='flex justify-between items-center'>
      {isEditing ? (
        <Input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className='w-64'
          autoFocus
          onBlur={handleSave}
          onKeyUp={(e) => e.key === 'Enter' && handleSave()}
        />
      ) : (
        <CardTitle className='text-lg font-bold text-primary'>{coursePhase?.name}</CardTitle>
      )}
      {canEdit && !isEditing && (
        <Button
          variant='ghost'
          size='icon'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          <Pen className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}
