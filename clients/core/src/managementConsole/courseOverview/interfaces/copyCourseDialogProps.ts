export interface CourseCopyDialogProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
}

export type DialogStep = 'form' | 'warning' | 'loading'

export interface CopyabilityData {
  copyable: boolean
  missingPhaseTypes?: string[]
}
