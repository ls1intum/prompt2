import { TeaseStudent } from '../interfaces/tease/student'

export type StudentCheck = {
  label: string
  extractor: (student: TeaseStudent) => any
  isEmpty: (value: any) => boolean
  missingMessage: string
  problemDescription: string
  userHint: string
  category: 'previous' | 'devices' | 'comments' | 'score' | 'language' | 'survey'
  highLevelCategory: 'previous' | 'survey'
  icon: React.ReactNode
}
