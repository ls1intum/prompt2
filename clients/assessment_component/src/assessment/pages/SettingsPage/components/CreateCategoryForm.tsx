import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { useState } from 'react'
import { AlertCircle, Plus } from 'lucide-react'
import { useCreateCategory } from '../hooks/useCreateCategory'
import { CreateCategoryRequest } from '../../../interfaces/category'

export const CreateCategoryForm = () => {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<CreateCategoryRequest>()
  const { mutate, isPending } = useCreateCategory(setError)

  const onSubmit = (data: CreateCategoryRequest) => {
    mutate(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  return (
    <Card className='shadow-sm transition-all hover:shadow-md'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-medium flex items-center gap-2'>
          <Plus className='h-4 w-4 text-muted-foreground' />
          Create New Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Category Name
            </Label>
            <Input
              id='name'
              placeholder='Enter category name'
              className='focus-visible:ring-1'
              {...register('name', { required: true })}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Short Category Name
            </Label>
            <Input
              id='name'
              placeholder='Enter short category name'
              className='focus-visible:ring-1'
              {...register('shortName', { required: true })}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              placeholder='Enter category description (optional)'
              className='resize-none min-h-[80px] focus-visible:ring-1'
              {...register('description')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='weight' className='text-sm font-medium'>
              Weight
            </Label>
            <Input
              id='weight'
              type='number'
              placeholder='Enter weight'
              className='focus-visible:ring-1'
              {...register('weight', {
                required: true,
                valueAsNumber: true,
                validate: (value) => value > 0 || 'Weight must be greater than 0',
              })}
            />
          </div>

          {error && (
            <div className='flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md'>
              <AlertCircle className='h-4 w-4' />
              <p>{error}</p>
            </div>
          )}

          <Button type='submit' disabled={isPending} className='w-full sm:w-auto'>
            {isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
