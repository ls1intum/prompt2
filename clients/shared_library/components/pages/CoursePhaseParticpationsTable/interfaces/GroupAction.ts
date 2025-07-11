export interface GroupAction {
  label: string
  icon?: React.ReactNode
  onAction: (participationIds: string[]) => void
  confirm?: {
    title?: string
    description?: string
    confirmLabel?: string
  }
}
