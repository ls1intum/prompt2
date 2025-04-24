import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Competency, UpdateCompetencyRequest } from '../../../interfaces/competency'
import { useUpdateCompetency } from '../hooks/useUpdateCompetency'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const updateCompetencySchema = z.object({
  id: z.string(),
  categoryID: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  novice: z.string().min(1, 'Novice level description is required'),
  intermediate: z.string().min(1, 'Intermediate level description is required'),
  advanced: z.string().min(1, 'Advanced level description is required'),
  expert: z.string().min(1, 'Expert level description is required'),
  weight: z.number().min(0, 'Weight must be positive').max(100, 'Weight cannot exceed 100'),
})

interface EditCompetencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  competency?: Competency
}

export function EditCompetencyDialog({
  open,
  onOpenChange,
  competency,
}: EditCompetencyDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const { mutate, isPending: isUpdating } = useUpdateCompetency(setError)

  const form = useForm<UpdateCompetencyRequest>({
    defaultValues: {
      id: competency?.id,
      categoryID: competency?.categoryID,
      name: competency?.name,
      description: competency?.description,
      novice: competency?.novice,
      intermediate: competency?.intermediate,
      advanced: competency?.advanced,
      expert: competency?.expert,
      weight: competency?.weight,
    },
    resolver: zodResolver(updateCompetencySchema),
  })

  useEffect(() => {
    if (competency) {
      form.reset({
        id: competency.id,
        categoryID: competency.categoryID,
        name: competency.name,
        description: competency.description,
        novice: competency.novice,
        intermediate: competency.intermediate,
        advanced: competency.advanced,
        expert: competency.expert,
        weight: competency.weight,
      })
    }
  }, [competency, form])

  useEffect(() => {
    if (!open || !competency) return

    const subscription = form.watch((value, { name, type }) => {
      if (name && type === 'change') {
        const data = form.getValues() as UpdateCompetencyRequest
        mutate(data)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, mutate, open, competency])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Competency</DialogTitle>
          <DialogDescription>Update the competency details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competency Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter competency name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter competency description'
                      className='resize-none min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='novice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novice Level</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe novice level'
                        className='resize-none min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='intermediate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intermediate Level</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe intermediate level'
                        className='resize-none min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='advanced'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advanced Level</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe advanced level'
                        className='resize-none min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='expert'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expert Level</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe expert level'
                        className='resize-none min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='weight'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {isUpdating ? 'Saving...' : 'Close'}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
