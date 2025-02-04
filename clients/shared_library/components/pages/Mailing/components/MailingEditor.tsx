import { Label } from '@/components/ui/label'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MailingTiptapEditor from '@/components/minimal-tiptap/mailing-tiptap'

interface EmailTemplateEditorProps {
  subject: string
  content: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  subjectHTMLLabel: string
  contentHTMLLabel: string
  placeholders: string[]
}

export const EmailTemplateEditor = ({
  subject,
  content,
  onInputChange,
  label,
  subjectHTMLLabel,
  contentHTMLLabel,
  placeholders,
}: EmailTemplateEditorProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label} Mail Template</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor={subjectHTMLLabel}>{label} Subject</Label>
          <Input
            type='text'
            name={subjectHTMLLabel}
            value={subject}
            onChange={(e) => onInputChange(e)}
            className='w-full mt-1'
          />
        </div>
        <div>
          <Label htmlFor={contentHTMLLabel}>{label} E-Mail Template</Label>
          <TooltipProvider>
            <MailingTiptapEditor
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
              placeholders={placeholders}
            />
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
