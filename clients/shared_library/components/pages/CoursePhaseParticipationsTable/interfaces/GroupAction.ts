export interface GroupAction {
  label: string
  icon?: React.ReactNode
  onAction: (participationIds: string[]) => void
  singleRecordOnly?: boolean
  confirm?: {
    title?: string
    description?: string
    confirmLabel?: string
  }
}
