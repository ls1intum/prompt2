import { DropdownMenuItem } from '@tumaet/prompt-ui-components'
import { FileDown } from 'lucide-react'

interface ExportActionMenuItemProps {
  rows: string[]
  onExport: (ids: string[]) => void
  onFinish: () => void
}

export const ExportActionMenuItem = ({ rows, onExport, onFinish }: ExportActionMenuItemProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        onExport(rows)
        onFinish()
      }}
    >
      <FileDown className='mr-2 h-4 w-4' />
      Export
    </DropdownMenuItem>
  )
}
