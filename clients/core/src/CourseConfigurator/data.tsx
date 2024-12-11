import { CreateCoursePhase } from '@/interfaces/course_phase'
import { CoursePhaseType } from '@/interfaces/course_phase_type'

// TODO get from db
export const phaseTypes: CoursePhaseType[] = [
  {
    id: '1',
    name: 'Application Phase',
    input_meta_data: [],
    output_meta_data: ['deviceInfo', 'developerAccount'],
    initial_phase: true,
  },
  {
    id: '2',
    name: 'Intro Phase',
    input_meta_data: ['developerAccount', 'deviceInfo'],
    output_meta_data: ['proficiency'],
    initial_phase: false,
  },
  {
    id: '3',
    name: 'Team Phase',
    input_meta_data: ['proficiency', 'developerAccount'],
    output_meta_data: [],
    initial_phase: false,
  },
]

export const coursePhases: CreateCoursePhase[] = []
