import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { QuestionConfigFormDataMultiSelect } from '../../../../validations/questionConfig'

export function MultiSelectConfig({
  form,
}: {
  form: UseFormReturn<QuestionConfigFormDataMultiSelect>
}) {
  const {
    fields: options,
    append,
    remove,
  } = useFieldArray({
    control: form.control as any,
    name: 'options',
  })

  const minSelect = form.watch('min_select') || 0
  const maxSelect = form.watch('max_select') || options.length

  return (
    <div className='space-y-4'>
      <div>
        <FormItem>
          <FormLabel>
            Options <span className='text-destructive'> *</span>
          </FormLabel>
          <FormControl>
            {/* Wrap multiple children in a single parent */}
            <>
              {options.map((option, index) => (
                <div key={option.id} className='flex items-center space-x-2 mt-2'>
                  <FormField
                    control={form.control}
                    name={`options.${index}`}
                    render={({ field }) => <Input {...field} placeholder={`Option ${index + 1}`} />}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => remove(index)}
                    disabled={options.length === 1} // Prevent removing the last option
                  >
                    <MinusIcon className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </>
          </FormControl>
          {/* Array-Level Error Message */}
          {form.formState.errors.options &&
            Array.isArray(form.formState.errors.options) &&
            form.formState.errors.options.length > 0 &&
            form.formState.errors.options[0]?.message && (
              <FormMessage className='text-red-500'>
                {form.formState.errors.options[0].message}
              </FormMessage>
            )}
          {form.formState.errors.options &&
            typeof form.formState.errors.options === 'object' &&
            typeof form.formState.errors.options.message === 'string' && (
              <FormMessage className='text-red-500'>
                {form.formState.errors.options.message}
              </FormMessage>
            )}
        </FormItem>
        <Button type='button' variant='outline' className='mt-2' onClick={() => append('')}>
          <PlusIcon className='h-4 w-4 mr-2' />
          Add Option
        </Button>
      </div>
      <div className='flex space-x-4'>
        <FormField
          control={form.control}
          name='min_select'
          render={({ field }) => (
            <FormItem className='flex-1'>
              <FormLabel>
                Min Required <span className='text-destructive'> *</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  disabled={options.length === 0}
                  min={0}
                  max={Math.min(maxSelect, options.length)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    field.onChange(value > maxSelect ? maxSelect : value)
                  }}
                />
              </FormControl>
              <FormDescription>The min amount of options required to be selected.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='max_select'
          render={({ field }) => (
            <FormItem className='flex-1'>
              <FormLabel>
                Max Allowed <span className='text-destructive'> *</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  disabled={options.length === 0}
                  min={Math.max(1, minSelect)}
                  max={options.length}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    field.onChange(value < minSelect ? minSelect : value)
                  }}
                />
              </FormControl>
              <FormDescription>The max amount of options allowed to be selected.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
