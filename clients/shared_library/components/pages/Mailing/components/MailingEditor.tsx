import React, { useState } from 'react'
import {
  Label,
  TooltipProvider,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MailingTiptapEditor,
} from '@tumaet/prompt-ui-components'

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
  // Local state to hold warning message
  const [subjectWarning, setSubjectWarning] = useState('')

  // Regular expression to allow only ASCII characters
  const asciiOnlyRegex = /^[\x20-\x7F]*$/

  // Custom onChange handler for subject input
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!asciiOnlyRegex.test(value)) {
      // Set a warning message and do not propagate the change
      setSubjectWarning('Warning: Only ASCII characters are allowed.')
      return
    }
    // Clear any warning and propagate the valid change
    setSubjectWarning('')
    onInputChange(e)
  }

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
            onChange={handleSubjectChange}
            className='w-full mt-1'
          />
          {subjectWarning && <p className='text-red-500 text-sm mt-1'>{subjectWarning}</p>}
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
              placeholder='Type your email here...'
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
