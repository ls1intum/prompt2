import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormControl, FormLabel, Checkbox } from '@tumaet/prompt-ui-components'
import { QuestionConfigFormData } from '@core/validations/questionConfig'

interface RequiredFieldProps {
  form: UseFormReturn<QuestionConfigFormData>
}

export const RequiredField = ({ form }: RequiredFieldProps) => {
  return (
    <FormField
      control={form.control}
      name='isRequired'
      render={({ field }) => (
        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
          <FormControl>
            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className='space-y-1 leading-none'>
            <FormLabel>Question is required to be answered</FormLabel>
          </div>
        </FormItem>
      )}
    />
  )
}
