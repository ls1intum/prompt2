import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@tumaet/prompt-ui-components'
import { Plus, FileText, AlertCircle } from 'lucide-react'

import { useGetAllAssessmentTemplates } from '../hooks/useGetAllAssessmentTemplates'
import { useGetCurrentAssessmentTemplate } from '../hooks/useGetCurrentAssessmentTemplate'
import { useCreateAssessmentTemplate } from '../hooks/useCreateAssessmentTemplate'
import { useCreateOrUpdateAssessmentTemplateCoursePhase } from '../hooks/useCreateOrUpdateAssessmentTemplateCoursePhase'
import { CreateAssessmentTemplateRequest } from '../../../interfaces/assessmentTemplate'

export const AssessmentTemplateSelection = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: templates, isLoading: templatesLoading } = useGetAllAssessmentTemplates()
  const { data: currentTemplate } = useGetCurrentAssessmentTemplate()

  const createTemplateMutation = useCreateAssessmentTemplate(setError)
  const assignTemplateMutation = useCreateOrUpdateAssessmentTemplateCoursePhase(setError)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAssessmentTemplateRequest>()

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

  const onSubmitNewTemplate = (data: CreateAssessmentTemplateRequest) => {
    createTemplateMutation.mutate(data, {
      onSuccess: () => {
        reset()
        setIsDialogOpen(false)
        setError(null)
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <Card className='shadow-sm transition-all hover:shadow-md'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          Assessment Template
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                  <Plus className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Create New Assessment Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitNewTemplate)} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input
                      id='name'
                      {...register('name', { required: 'Name is required' })}
                      placeholder='Template name'
                    />
                    {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      {...register('description', { required: 'Description is required' })}
                      placeholder='Template description'
                      rows={3}
                    />
                    {errors.description && (
                      <p className='text-sm text-red-600'>{errors.description.message}</p>
                    )}
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsDialogOpen(false)
                        reset()
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' disabled={createTemplateMutation.isPending}>
                      {createTemplateMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
