import { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Input,
} from '@tumaet/prompt-ui-components'
import { QuestionConfigFormData } from '@core/validations/questionConfig'

interface ErrorMessageFieldProps {
  form: UseFormReturn<QuestionConfigFormData>
  isCheckboxQuestion: boolean
  isMultiSelectType: boolean
}

export const ErrorMessageField = ({
  form,
  isCheckboxQuestion,
  isMultiSelectType,
}: ErrorMessageFieldProps) => {
  return (
    <FormField
      control={form.control}
      name='errorMessage'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Custom Error Message</FormLabel>
          <FormControl>
            <Input {...field} placeholder='Enter error message' />
          </FormControl>
          <FormDescription>
            {isCheckboxQuestion && 'This message will be shown if the checkbox is not checked'}
            {!isMultiSelectType &&
              'This error message will be shown if the question does not match the validation regex. If regex is empty, this has no effect.'}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
