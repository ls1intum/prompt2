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
import { Gender } from '@/interfaces/gender'
import { studentSchema, StudentFormValues } from '../../validations/student'

interface StudentFormProps {
  student: Student
  onUpdate: (updatedStudent: Student) => void
}

export const StudentForm = forwardRef<StudentComponentRef, StudentFormProps>(function StudentForm(
  { student, onUpdate },
  ref,
) {
  const hasUniversityAccount = student.hasUniversityAccount
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: hasUniversityAccount
      ? {
          matriculationNumber: student.matriculationNumber || '',
          universityLogin: student.universityLogin || '',
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          email: student.email || '',
          gender: student.gender ?? undefined,
          hasUniversityAccount: true,
        }
      : {
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          email: student.email || '',
          gender: student.gender ?? undefined,
          hasUniversityAccount: false,
        },
    mode: 'onTouched',
  })

  useImperativeHandle(ref, () => ({
    async validate() {
      const valid = await form.trigger()
      return valid
    },
  }))

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({ ...student, ...value })
    })
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form.watch, student, onUpdate, form])

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
              name='matriculationNumber'
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
            <FormField
              control={form.control}
              name='universityLogin'
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
          </div>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={hasUniversityAccount} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={hasUniversityAccount} />
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
                <Input {...field} type='email' disabled={hasUniversityAccount} />
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
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a gender' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Gender).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender.replace(/_/g, ' ')}
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
