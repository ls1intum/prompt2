import { Course } from '@tumaet/prompt-shared-state'

export interface CourseWithTemplateInfo extends Course {
  template: boolean
}
