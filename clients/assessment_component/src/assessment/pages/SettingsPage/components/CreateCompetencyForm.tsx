import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useCreateCompetency } from '../hooks/useCreateCompetency'
import type { CreateCompetencyRequest } from '../../../interfaces/competency'

export const CreateCompetencyForm = ({ categoryID }: { categoryID: string }) => {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompetencyRequest>({
    defaultValues: { categoryID, weight: 1 },
  })

  const { mutate, isPending } = useCreateCompetency(setError)

  const onSubmit = (data: CreateCompetencyRequest) => {
    mutate(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  return (
    <Card className='w-full shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-xl font-semibold'>Create New Competency</CardTitle>
      </CardHeader>

      <CardContent>
        <form id='competency-form' onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <input type='hidden' {...register('categoryID', { required: true })} />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='font-medium'>
                Name
              </Label>
              <Input
                id='name'
                placeholder='Enter competency name'
                className={errors.name ? 'border-red-500' : ''}
                aria-invalid={errors.name ? 'true' : 'false'}
                {...register('name', { required: true })}
              />
              {errors.name && <p className='text-sm text-red-500 mt-1'>Name is required</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='weight' className='font-medium'>
                Weight
              </Label>
              <Input
                id='weight'
                placeholder='Enter competency name'
                className={errors.weight ? 'border-red-500' : ''}
                aria-invalid={errors.weight ? 'true' : 'false'}
                {...register('weight', { required: true })}
              />
              {errors.weight && <p className='text-sm text-red-500 mt-1'>Name is required</p>}
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 mb-6'>
            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='description' className='font-medium'>
                Description
              </Label>
              <Textarea
                id='description'
                placeholder='Brief description of this competency'
                className={`resize-none h-10 ${errors.description ? 'border-red-500' : ''}`}
                aria-invalid={errors.description ? 'true' : 'false'}
                {...register('description', { required: true })}
              />
              {errors.description && (
                <p className='text-sm text-red-500 mt-1'>Description is required</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-medium text-muted-foreground'>Proficiency Levels</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='novice' className='font-medium'>
                  Novice
                </Label>
                <Input
                  id='novice'
                  placeholder='Novice level description'
                  className={errors.novice ? 'border-red-500' : ''}
                  aria-invalid={errors.novice ? 'true' : 'false'}
                  {...register('novice', { required: true })}
                />
                {errors.novice && (
                  <p className='text-sm text-red-500 mt-1'>Novice description is required</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='intermediate' className='font-medium'>
                  Intermediate
                </Label>
                <Input
                  id='intermediate'
                  placeholder='Intermediate level description'
                  className={errors.intermediate ? 'border-red-500' : ''}
                  aria-invalid={errors.intermediate ? 'true' : 'false'}
                  {...register('intermediate', { required: true })}
                />
                {errors.intermediate && (
                  <p className='text-sm text-red-500 mt-1'>Intermediate description is required</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='advanced' className='font-medium'>
                  Advanced
                </Label>
                <Input
                  id='advanced'
                  placeholder='Advanced level description'
                  className={errors.advanced ? 'border-red-500' : ''}
                  aria-invalid={errors.advanced ? 'true' : 'false'}
                  {...register('advanced', { required: true })}
                />
                {errors.advanced && (
                  <p className='text-sm text-red-500 mt-1'>Advanced description is required</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expert' className='font-medium'>
                  Expert
                </Label>
                <Input
                  id='expert'
                  placeholder='Expert level description'
                  className={errors.advanced ? 'border-red-500' : ''}
                  aria-invalid={errors.advanced ? 'true' : 'false'}
                  {...register('expert', { required: true })}
                />
                {errors.expert && (
                  <p className='text-sm text-red-500 mt-1'>Expert description is required</p>
                )}
              </div>
            </div>
          </div>

          <Button type='submit' disabled={isPending} className='w-full sm:w-auto'>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>

        {error && (
          <Alert variant='destructive' className='mt-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
