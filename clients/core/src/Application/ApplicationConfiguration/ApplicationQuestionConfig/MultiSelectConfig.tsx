import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { QuestionConfigFormData } from 'src/validations/questionConfig'

export function MultiSelectConfig({ form }: { form: UseFormReturn<QuestionConfigFormData> }) {
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
        <FormLabel>Options</FormLabel>
        {options.map((option, index) => (
          <FormField
            key={option.id}
            control={form.control}
            name={`options.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='flex items-center space-x-2 mt-2'>
                    <Input {...field} placeholder={`Option ${index + 1}`} />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => remove(index)}
                    >
                      <MinusIcon className='h-4 w-4' />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
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
              <FormLabel>Min Required</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='max_select'
          render={({ field }) => (
            <FormItem className='flex-1'>
              <FormLabel>Max Allowed</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
