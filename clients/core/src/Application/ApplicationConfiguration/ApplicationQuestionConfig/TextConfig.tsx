import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import { QuestionConfigFormData } from 'src/validations/questionConfig'

export function TextConfig({ form }: { form: UseFormReturn<QuestionConfigFormData> }) {
  return (
    <div className='space-y-4'>
      <FormField
        control={form.control}
        name='validation_regex'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validation Regex</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter validation regex' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='allowed_length'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allowed Length</FormLabel>
            <FormControl>
              <Input
                type='number'
                {...field}
                min={1}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === '' ? '' : Number(value))
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
