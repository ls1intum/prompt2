import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useCreateCategory } from '../../hooks/useCreateCategory'

interface CreateCategoryFormData {
  name: string
  description?: string
}

export const CreateCategoryForm = () => {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<CreateCategoryFormData>()
  const { mutate, isPending } = useCreateCategory(setError)

  const onSubmit = (data: CreateCategoryFormData) => {
    mutate(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Category Name</Label>
        <Input id='name' {...register('name', { required: true })} />
      </div>
      <div>
        <Label htmlFor='description'>Description</Label>
        <Textarea id='description' {...register('description')} />
      </div>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      <Button type='submit' disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Category'}
      </Button>
    </form>
  )
}
