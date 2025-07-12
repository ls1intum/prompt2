import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  DatePicker,
} from '@tumaet/prompt-ui-components'
import { FileText, Calendar } from 'lucide-react'

import { AssessmentTemplate } from '../../../../../interfaces/assessmentTemplate'

import { AssessmentType } from '../../../interfaces/assessmentType'

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
    <div className='grid xl:grid-cols-4 gap-4'>
      <div className='xl:col-span-2 space-y-4'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4' />
          <Label className='text-sm font-medium'>
            {type === AssessmentType.SELF && 'Self Evaluation Template'}
            {type === AssessmentType.PEER && 'Peer Evaluation Template'}
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
            {type === AssessmentType.SELF && 'Self Evaluation Start'}
            {type === AssessmentType.PEER && 'Peer Evaluation Start'}
            {type === AssessmentType.ASSESSMENT && 'Assessment Start'}
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <DatePicker
            date={startDate}
            onSelect={(date) =>
              setStartDate(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
            }
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          <Label className='text-sm font-medium'>
            {type === AssessmentType.SELF && 'Self Evaluation Deadline'}
            {type === AssessmentType.PEER && 'Peer Evaluation Deadline'}
            {type === AssessmentType.ASSESSMENT && 'Assessment Deadline'}
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <DatePicker
            date={deadline}
            onSelect={(date) =>
              setDeadline(date ? new Date(format(date, 'yyyy-MM-dd')) : undefined)
            }
          />
        </div>
      </div>
    </div>
  )
}
