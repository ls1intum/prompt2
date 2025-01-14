export interface ApplicationQuestionText {
  id: string
  course_phase_id: string
  title: string
  description?: string
  placeholder?: string
  validation_regex?: string
  error_message?: string
  is_required: boolean
  allowed_length?: number
  order_num: number
  accessible_for_other_phases?: boolean
  access_key?: string
}
