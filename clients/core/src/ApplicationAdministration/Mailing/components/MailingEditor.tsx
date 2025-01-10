import MinimalTiptapEditor from '@/components/minimal-tiptap/minimal-tiptap'
import { Label } from '@/components/ui/label'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'

interface EmailTemplateEditorProps {
  subject: string
  content: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  subjectHTMLLabel: string
  contentHTMLLabel: string
}

export const EmailTemplateEditor = ({
  subject,
  content,
  onInputChange,
  label,
  subjectHTMLLabel,
  contentHTMLLabel,
}: EmailTemplateEditorProps): JSX.Element => {
  return (
    <div className='space-y-2'>
      <div>
        <Label htmlFor={subjectHTMLLabel}>{label} Subject</Label>
        <Input
          type='text'
          id={subjectHTMLLabel}
          value={subject}
          onChange={(e) => onInputChange(e)}
          className='w-full mt-1'
        />
      </div>
      <div>
        <Label htmlFor={contentHTMLLabel}>{label} E-Mail Template</Label>
        <TooltipProvider>
          <MinimalTiptapEditor
            value={content}
            onChange={(newContent) =>
              onInputChange({
                target: { name: contentHTMLLabel, value: newContent },
              } as any)
            }
            className='w-full mt-1'
            editorContentClassName='p-4'
            output='html'
            placeholder={`Type your email here...`}
            autofocus={false}
            editable={true}
            editorClassName='focus:outline-none'
          />
        </TooltipProvider>
      </div>
    </div>
  )
}
