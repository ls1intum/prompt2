import { CreateCoursePhase } from '@/interfaces/course_phase'
import { CoursePhaseType } from '@/interfaces/course_phase_type'
import { Edge } from '@xyflow/react'

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

export const coursePhases: CreateCoursePhase[] = [
  {
    id: '1',
    course_id: '1',
    name: 'Application Phase',
    position: { x: 0, y: 0 },
    is_initial_phase: true,
    course_phase_type_id: '1',
  },
  {
    id: '2',
    course_id: '1',
    name: 'Intro Phase',
    position: { x: 0, y: 0 },
    is_initial_phase: false,
    course_phase_type_id: '2',
  },
  {
    id: '3',
    course_id: '1',
    name: 'Team Phase',
    position: { x: 0, y: 0 },
    is_initial_phase: false,
    course_phase_type_id: '3',
  },
]

export const initialEdges: Edge[] = [
  {
    id: '1',
    source: '1',
    target: '2',
  },
  {
    id: '2',
    source: '2',
    target: '3',
    type: 'iconEdge',
  },
]
