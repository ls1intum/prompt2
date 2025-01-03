import { Student } from '@/interfaces/student'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { StudentComponentRef } from '../utils/StudentComponentRef'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Gender, getGenderString } from '@/interfaces/gender'
import { studentSchema, StudentFormValues } from '../../validations/student'
import translations from '@/lib/translations.json'

interface StudentFormProps {
  student: Student
  disabled?: boolean
  onUpdate: (updatedStudent: Student) => void
}

export const StudentForm = forwardRef<StudentComponentRef, StudentFormProps>(function StudentForm(
  { student, disabled = false, onUpdate },
  ref,
) {
  const hasUniversityAccount = student.has_university_account
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: hasUniversityAccount
      ? {
          matriculation_number: student.matriculation_number || '',
          university_login: student.university_login || '',
          first_name: student.first_name || '',
          last_name: student.last_name || '',
          email: student.email || '',
          gender: student.gender ?? undefined,
          has_university_account: true,
        }
      : {
          first_name: student.first_name || '',
          last_name: student.last_name || '',
          email: student.email || '',
          gender: student.gender ?? undefined,
          has_university_account: false,
        },
    mode: 'onChange',
  })

  useImperativeHandle(ref, () => ({
    async validate() {
      const valid = await form.trigger()
      return valid
    },
    rerender(updatedStudent: Student) {
      form.reset(
        updatedStudent.has_university_account
          ? {
              matriculation_number: updatedStudent.matriculation_number || '',
              university_login: updatedStudent.university_login || '',
              first_name: updatedStudent.first_name || '',
              last_name: updatedStudent.last_name || '',
              email: updatedStudent.email || '',
              gender: updatedStudent.gender ?? undefined,
              has_university_account: true,
            }
          : {
              first_name: updatedStudent.first_name || '',
              last_name: updatedStudent.last_name || '',
              email: updatedStudent.email || '',
              gender: updatedStudent.gender ?? undefined,
              has_university_account: false,
            },
      )
    },
  }))

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({ ...student, ...value })
    })
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form.watch, student, onUpdate, form])

  const requiredStar = <span className='text-destructive'> *</span>

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onUpdate({ ...student, ...data }))}
        className='space-y-6'
      >
        {hasUniversityAccount && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='matriculation_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Matriculation Number
                    {requiredStar}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='university_login'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {translations.university['login-name']}
                    {requiredStar}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name{requiredStar}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={hasUniversityAccount || disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name{requiredStar}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={hasUniversityAccount || disabled} />
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
              <FormLabel>Email{requiredStar}</FormLabel>
              <FormControl>
                <Input {...field} type='email' disabled={hasUniversityAccount || disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='gender'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender{requiredStar}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a gender' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Gender).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {getGenderString(gender)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
})
