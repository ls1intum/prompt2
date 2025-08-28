import { UseFormReturn, useWatch } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Input,
  Switch,
} from '@tumaet/prompt-ui-components'
import { QuestionConfigFormData } from '@core/validations/questionConfig'

interface ExportSettingsFieldsProps {
  form: UseFormReturn<QuestionConfigFormData>
}

export const ExportSettingsFields = ({ form }: ExportSettingsFieldsProps) => {
  const accessible = useWatch({ control: form.control, name: 'accessibleForOtherPhases' })
  return (
    <>
      <div className='space-y-2'>
        <label className='text-sm font-medium leading-none'>Export Settings</label>
        <FormField
          control={form.control}
          name='accessibleForOtherPhases'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 bg-white dark:bg-black'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Accessible for Other Phases</FormLabel>
                <FormDescription>
                  Allow this question to be accessed in other application phases
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (!checked) {
                      form.setValue('accessKey', '')
                    }
                  }}
                  aria-label='Toggle accessibility for other phases'
                />
              </FormControl>
            </FormItem>
          )}
        />
        {accessible && (
          <FormField
            control={form.control}
            name='accessKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Key</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter access key' />
                </FormControl>
                <FormDescription>
                  Provide a unique key to identify this question when accessing it from other phases
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  )
}
