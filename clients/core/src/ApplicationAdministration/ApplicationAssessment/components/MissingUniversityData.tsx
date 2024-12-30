import React from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UniversityDataFormValues,
  formSchemaUniversityData,
} from '../../../validations/universityData'
import { Student } from '@/interfaces/student'

interface MissingUniversityDataProps {
  student: Student
}

export const MissingUniversityData = ({ student }: MissingUniversityDataProps): JSX.Element => {
  const [isAddingData, setIsAddingData] = React.useState(false)

  // mutatation to update the student data!

  const form = useForm<UniversityDataFormValues>({
    resolver: zodResolver(formSchemaUniversityData),
    defaultValues: {
      university_login: student.university_login || '',
      matriculation_number: student.matriculation_number || '',
      email: student.email || '',
    },
  })

  function onSubmit(values: UniversityDataFormValues) {
    console.log('Submitted data:', values)
    // You can add a function here to handle saving the data to the backend.
    setIsAddingData(false) // Reset the form visibility
  }

  return (
    <Alert>
      <div className='flex items-center justify-between mb-2'>
        <AlertDescription className='flex items-center'>
          <AlertCircle className='h-4 w-4 mr-2' />
          The student has no university login.
        </AlertDescription>
        {!isAddingData && (
          <Button onClick={() => setIsAddingData(true)} variant='outline' size='sm'>
            Add University Data
          </Button>
        )}
      </div>
      {isAddingData && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='university_login'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Login</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='matriculation_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matriculation Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setIsAddingData(false)}
              >
                Cancel
              </Button>
              <Button type='submit' size='sm'>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Alert>
  )
}
