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
import type { CategoryWithCompetencies, UpdateCategoryRequest } from '../../../interfaces/category'
import { useUpdateCategory } from '../hooks/useUpdateCategory'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  weight: z.number().min(0, 'Weight must be positive').max(100, 'Weight cannot exceed 100'),
})

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryWithCompetencies
}

export function EditCategoryDialog({ open, onOpenChange, category }: EditCategoryDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const { mutate, isPending: isUpdating } = useUpdateCategory(setError)

  const form = useForm<UpdateCategoryRequest>({
    defaultValues: {
      id: category?.id,
      name: category?.name,
      description: category?.description,
      weight: category?.weight,
    },
    resolver: zodResolver(updateCategorySchema),
  })

  useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        description: category.description || '',
        weight: category.weight,
      })
    }
  }, [category, form])

  useEffect(() => {
    if (!open || !category) return

    const subscription = form.watch((value, { name, type }) => {
      if (name && type === 'change') {
        const data = form.getValues() as UpdateCategoryRequest
        mutate(data)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, mutate, open, category])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the category details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter category name' {...field} />
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
                      placeholder='Enter category description (optional)'
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
                Close
              </Button>
              {isUpdating && (
                <span className='text-sm text-muted-foreground'>Saving changes...</span>
              )}
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
