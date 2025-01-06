import * as React from 'react'
import './styles/index.css'

import type { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SectionTwo } from './components/section/two'
import { SectionFour } from './components/section/four'
import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu'
import { useMinimalTiptapEditor } from './hooks/use-minimal-tiptap'
import { MeasuredContainer } from './components/measured-container'
import { LinkEditPopover } from './components/link/link-edit-popover'
import { MinimalTiptapProps } from './minimal-tiptap'

const DescriptionEditorToolbar = ({ editor }: { editor: Editor }) => (
  <div className='shrink-0 overflow-x-auto border-b border-border p-2'>
    <div className='flex w-max items-center gap-px'>
      <SectionTwo
        editor={editor}
        activeActions={['bold', 'italic', 'underline', 'strikethrough', 'code', 'clearFormatting']}
        mainActionCount={3}
      />

      <Separator orientation='vertical' className='mx-2 h-7' />

      <SectionFour
        editor={editor}
        activeActions={['orderedList', 'bulletList']}
        mainActionCount={0}
      />

      <Separator orientation='vertical' className='mx-2 h-7' />

      <LinkEditPopover editor={editor} />
    </div>
  </div>
)

export const DescriptionMinimalTiptapEditor = React.forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      ...props,
    })

    if (!editor) {
      return null
    }

    return (
      <MeasuredContainer
        as='div'
        name='editor'
        ref={ref}
        className={cn(
          'flex h-auto min-h-70 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary',
          className,
        )}
      >
        <DescriptionEditorToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={cn('minimal-tiptap-editor', editorContentClassName)}
        />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    )
  },
)

DescriptionMinimalTiptapEditor.displayName = 'DescriptionMinimalTiptapEditor'
