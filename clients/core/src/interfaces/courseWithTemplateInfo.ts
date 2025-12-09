import type { CourseWithDescriptions } from '@core/interfaces/courseWithDescriptions'

export interface CourseWithTemplateInfo extends CourseWithDescriptions {
  template: boolean
}
