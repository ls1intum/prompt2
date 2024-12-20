import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

export function ApplicationQuestionCard({
  question,
  index,
  onUpdate,
}: {
  question: ApplicationQuestionMultiSelect | ApplicationQuestionText
  index: number
  onUpdate: (updatedQuestion: ApplicationQuestionMultiSelect | ApplicationQuestionText) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description || '')
  const [placeholder, setPlaceholder] = useState(question.placeholder || '')
  const [errorMessage, setErrorMessage] = useState(question.error_message || '')
  const [isRequired, setIsRequired] = useState(question.is_required)

  const isMultiSelect = 'options' in question

  const handleUpdate = () => {
    const updatedQuestion = {
      ...question,
      title,
      description,
      placeholder,
      error_message: errorMessage,
      is_required: isRequired,
    }
    onUpdate(updatedQuestion)
  }

  return (
    <Card className='mb-4'>
      <CardHeader className='cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className='flex justify-between items-center'>
          <span>{title || `Question ${index + 1}`}</span>
          {isExpanded ? <ChevronUp className='h-6 w-6' /> : <ChevronDown className='h-6 w-6' />}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label htmlFor={`title-${index}`}>Title</Label>
              <Input
                id={`title-${index}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter question title'
              />
            </div>
            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Input
                id={`description-${index}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter question description'
              />
            </div>
            <div>
              <Label htmlFor={`placeholder-${index}`}>Placeholder</Label>
              <Input
                id={`placeholder-${index}`}
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder='Enter placeholder text'
              />
            </div>
            <div>
              <Label htmlFor={`error-message-${index}`}>Error Message</Label>
              <Input
                id={`error-message-${index}`}
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder='Enter error message'
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id={`required-${index}`}
                checked={isRequired}
                onCheckedChange={(checked) => setIsRequired(checked as boolean)}
              />
              <Label htmlFor={`required-${index}`}>Required</Label>
            </div>

            {isMultiSelect ? (
              <MultiSelectConfig question={question as ApplicationQuestionMultiSelect} />
            ) : (
              <TextConfig question={question as ApplicationQuestionText} />
            )}

            <Button onClick={handleUpdate}>Update Question</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function MultiSelectConfig({ question }: { question: ApplicationQuestionMultiSelect }) {
  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='min-select'>Minimum Selections</Label>
        <Input
          id='min-select'
          type='number'
          defaultValue={question.min_select}
          min={0}
          max={question.options.length}
        />
      </div>
      <div>
        <Label htmlFor='max-select'>Maximum Selections</Label>
        <Input
          id='max-select'
          type='number'
          defaultValue={question.max_select}
          min={1}
          max={question.options.length}
        />
      </div>
      <div>
        <Label>Options</Label>
        {question.options.map((option, index) => (
          <Input key={index} defaultValue={option} className='mt-2' />
        ))}
      </div>
    </div>
  )
}

function TextConfig({ question }: { question: ApplicationQuestionText }) {
  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='validation-regex'>Validation Regex</Label>
        <Input
          id='validation-regex'
          defaultValue={question.validation_regex}
          placeholder='Enter validation regex'
        />
      </div>
      <div>
        <Label htmlFor='allowed-length'>Allowed Length</Label>
        <Input id='allowed-length' type='number' defaultValue={question.allowed_length} min={1} />
      </div>
    </div>
  )
}
