export interface CourseCopyDialogProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
  useTemplateCopy?: boolean
}

export type DialogStep = 'form' | 'warning' | 'loading'

export interface CopyabilityData {
  copyable: boolean
  missingPhaseTypes?: string[]
}
