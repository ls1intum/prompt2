import * as React from 'react'
import type { Editor } from '@tiptap/react'
import type { FormatAction } from '../../types'
import type { toggleVariants } from '@/components/ui/toggle'
import type { VariantProps } from 'class-variance-authority'
import { ListBulletIcon } from '@radix-ui/react-icons'
import { ToolbarSection } from '../toolbar-section'
import { MailSearch } from 'lucide-react'

const formatActions = (placeholders: string[]): FormatAction[] => {
  return placeholders.map((placeholder) => ({
    label: placeholder,
    icon: <ListBulletIcon className='size-5' />,
    action: (editor) => {
      editor.chain().focus().insertContent(`${placeholder}`).run()
    },
    isActive: () => false,
    canExecute: () => true,
    shortcuts: [],
    value: placeholder,
  }))
}

interface SectionMailingPlaceholderProps extends VariantProps<typeof toggleVariants> {
  editor: Editor
  placeholders: string[]
}

export const SectionMailingPlaceholders: React.FC<SectionMailingPlaceholderProps> = ({
  editor,
  placeholders,
  size,
  variant,
}) => {
  return (
    <ToolbarSection
      editor={editor}
      actions={formatActions(placeholders)}
      dropdownIcon={
        <>
          <MailSearch className='size-5' />
        </>
      }
      dropdownTooltip='Available Mailing Placeholders'
      size={size}
      variant={variant}
    />
  )
}

SectionMailingPlaceholders.displayName = 'MailingPlaceholders'

export default SectionMailingPlaceholders
