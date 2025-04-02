'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Plus } from 'lucide-react'
import { useCreateCategory } from '../hooks/useCreateCategory'

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
