import { CreateCoursePhase } from '@/interfaces/course_phase'
import { Edge } from '@xyflow/react'

export const coursePhases: CreateCoursePhase[] = []

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
