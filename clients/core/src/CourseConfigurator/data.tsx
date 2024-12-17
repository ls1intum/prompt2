import { CreateCoursePhase } from '@/interfaces/course_phase'
import { Edge } from '@xyflow/react'

export const coursePhases: CreateCoursePhase[] = [
  {
    id: '1',
    name: 'Phase 1',
    course_id: 'some id',
    course_phase_type_id: '1',
    position: { x: 100, y: 100 },
    is_initial_phase: false,
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
