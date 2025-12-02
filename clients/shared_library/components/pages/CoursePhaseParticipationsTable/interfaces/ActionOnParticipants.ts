export interface ActionOnParticipants {
  label: string
  icon?: React.ReactNode
  onAction: (participationIds: string[]) => void
  singleRecordOnly?: boolean
  confirm?: {
    title?: string
    description: string | ((count: number) => string)
    confirmLabel?: string
  }
}
