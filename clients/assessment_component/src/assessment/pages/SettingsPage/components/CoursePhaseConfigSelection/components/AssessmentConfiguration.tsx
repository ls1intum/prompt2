import { startOfDay, endOfDay } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  DatePickerWithRange,
} from '@tumaet/prompt-ui-components'
import { FileText, Calendar } from 'lucide-react'

import { AssessmentType } from '../../../../../interfaces/assessmentType'
import { AssessmentTemplate } from '../../../../../interfaces/assessmentTemplate'

import { CreateAssessmentTemplateDialog } from './CreateAssessmentTemplateDialog'

interface AsssessmentConfigurationProps {
  type: AssessmentType
  assessmentTemplateId: string
  setAssessmentTemplateId: (id: string) => void
  startDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  deadline: Date | undefined
  setDeadline: (date: Date | undefined) => void
  templates: AssessmentTemplate[]
  configMutation: any
  setError: (error: string | undefined) => void
}

export const AssessmentConfiguration = ({
  type,
  assessmentTemplateId,
  setAssessmentTemplateId,
  startDate,
  setStartDate,
  deadline,
  setDeadline,
  templates,
  configMutation,
  setError,
}: AsssessmentConfigurationProps) => {
  return (
    <div className='grid xl:grid-cols-3 gap-4'>
      <div className='xl:col-span-2 space-y-4'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4' />
          <Label className='text-sm font-medium'>
            {type === AssessmentType.SELF && 'Self Evaluation Template'}
            {type === AssessmentType.PEER && 'Peer Evaluation Template'}
            {type === AssessmentType.TUTOR && 'Tutor Evaluation Template'}
            {type === AssessmentType.ASSESSMENT && 'Assessment Template'}
          </Label>
        </div>
        <div className='flex gap-2'>
          <Select
            value={assessmentTemplateId}
            onValueChange={setAssessmentTemplateId}
            disabled={configMutation.isPending}
          >
            <SelectTrigger className='flex-1'>
              <SelectValue placeholder='Select a template...' />
            </SelectTrigger>
            <SelectContent>
              {templates?.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateAssessmentTemplateDialog onError={setError} />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          <Label className='text-sm font-medium'>
            {type === AssessmentType.SELF && 'Self Evaluation Timeframe'}
            {type === AssessmentType.PEER && 'Peer Evaluation Timeframe'}
            {type === AssessmentType.TUTOR && 'Tutor Evaluation Timeframe'}
            {type === AssessmentType.ASSESSMENT && 'Assessment Timeframe'}
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <DatePickerWithRange
            date={{
              from: startDate,
              to: deadline,
            }}
            setDate={(dateRange) => {
              setStartDate(dateRange?.from ? startOfDay(dateRange.from) : undefined)
              setDeadline(dateRange?.to ? endOfDay(dateRange.to) : undefined)
            }}
          />
        </div>
      </div>
    </div>
  )
}
