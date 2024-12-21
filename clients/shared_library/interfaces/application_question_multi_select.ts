export interface ApplicationQuestionMultiSelect {
  id: string
  course_phase_id: string
  title: string
  description?: string
  placeholder?: string
  error_message?: string
  is_required: boolean
  min_select: number
  max_select: number
  options: string[]
  order_num: number
}
