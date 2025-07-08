import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@tumaet/prompt-ui-components'
import { Plus } from 'lucide-react'

import { useCreateAssessmentTemplate } from '../hooks/useCreateAssessmentTemplate'
import { CreateAssessmentTemplateRequest } from '../../../../../interfaces/assessmentTemplate'

interface CreateAssessmentTemplateDialogProps {
  onError: (error: string | null) => void
}

export const CreateAssessmentTemplateDialog = ({
  onError,
}: CreateAssessmentTemplateDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const createTemplateMutation = useCreateAssessmentTemplate(onError)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAssessmentTemplateRequest>()

  const onSubmitNewTemplate = (data: CreateAssessmentTemplateRequest) => {
    createTemplateMutation.mutate(data, {
      onSuccess: () => {
        reset()
        setIsDialogOpen(false)
        onError(null)
      },
      onError: (err) => onError(err.message),
    })
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    reset()
    onError(null)
  }

  return (
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
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
