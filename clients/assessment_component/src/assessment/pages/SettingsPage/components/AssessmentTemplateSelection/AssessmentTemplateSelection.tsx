import { useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@tumaet/prompt-ui-components'
import { FileText, AlertCircle } from 'lucide-react'

import { useGetAllAssessmentTemplates } from './hooks/useGetAllAssessmentTemplates'
import { useGetCurrentAssessmentTemplate } from './hooks/useGetCurrentAssessmentTemplate'
import { useCreateOrUpdateAssessmentTemplateCoursePhase } from './hooks/useCreateOrUpdateAssessmentTemplateCoursePhase'
import { CreateAssessmentTemplateDialog } from './components/CreateAssessmentTemplateDialog'

export const AssessmentTemplateSelection = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [error, setError] = useState<string | null>(null)

  const { data: templates, isLoading: templatesLoading } = useGetAllAssessmentTemplates()
  const { data: currentTemplate } = useGetCurrentAssessmentTemplate()

  const assignTemplateMutation = useCreateOrUpdateAssessmentTemplateCoursePhase(setError)

  const handleTemplateSelect = (templateID: string) => {
    if (!phaseId) return
    assignTemplateMutation.mutate(
      {
        assessmentTemplateID: templateID,
        coursePhaseID: phaseId,
      },
      {
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <Card className='md:col-span-2 shadow-sm transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          Template
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <div className='flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg'>
            <AlertCircle className='h-4 w-4' />
            <span className='text-sm'>{error}</span>
          </div>
        )}

        <div className='space-y-2'>
          <Label htmlFor='template-select'>Select Assessment Template</Label>
          <div className='flex gap-2'>
            <Select
              value={currentTemplate?.id || ''}
              onValueChange={handleTemplateSelect}
              disabled={templatesLoading || assignTemplateMutation.isPending}
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

        {currentTemplate && (
          <div className='bg-blue-50 p-3 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>Current template:</strong> {currentTemplate.name}
            </p>
            {currentTemplate.description && (
              <p className='text-sm text-blue-600 mt-1'>{currentTemplate.description}</p>
            )}
          </div>
        )}

        {assignTemplateMutation.isPending && (
          <p className='text-sm text-gray-600'>Updating template assignment...</p>
        )}
      </CardContent>
    </Card>
  )
}
