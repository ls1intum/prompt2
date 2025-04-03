import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
    defaultValues: { categoryID },
  })

  const { mutate, isPending } = useCreateCompetency(setError)

  const onSubmit = (data: CreateCompetencyRequest) => {
    mutate(data, {
      onSuccess: () => reset(),
    })
  }

  return (
    <Card className='w-full shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-xl font-semibold'>Create New Competency</CardTitle>
      </CardHeader>

      <CardContent>
        <form id='competency-form' onSubmit={handleSubmit(onSubmit)}>
          <input type='hidden' {...register('categoryID', { required: true })} />

          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='font-medium'>
                Name
              </Label>
              <Input
                id='name'
                placeholder='Enter competency name'
                className={errors.name ? 'border-red-500' : ''}
                {...register('name', { required: true })}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description' className='font-medium'>
                Description
              </Label>
              <Textarea
                id='description'
                placeholder='Brief description of this competency'
                className='resize-none h-10'
                {...register('description', { required: true })}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-muted-foreground'>Proficiency Levels</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='novice' className='font-medium'>
                  Novice
                </Label>
                <Input
                  id='novice'
                  placeholder='Novice level description'
                  {...register('novice', { required: true })}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='intermediate' className='font-medium'>
                  Intermediate
                </Label>
                <Input
                  id='intermediate'
                  placeholder='Intermediate level description'
                  {...register('intermediate', { required: true })}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='advanced' className='font-medium'>
                  Advanced
                </Label>
                <Input
                  id='advanced'
                  placeholder='Advanced level description'
                  {...register('advanced', { required: true })}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expert' className='font-medium'>
                  Expert
                </Label>
                <Input
                  id='expert'
                  placeholder='Expert level description'
                  {...register('expert', { required: true })}
                />
              </div>
            </div>
          </div>
        </form>

        {error && (
          <Alert variant='destructive' className='mt-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className='flex justify-end border-t pt-4'>
        <Button type='submit' form='competency-form' disabled={isPending} className='px-6'>
          {isPending ? 'Creating...' : 'Create'}
        </Button>
      </CardFooter>
    </Card>
  )
}
