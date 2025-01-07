import { Student } from '@/interfaces/student'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
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

// Getting the list of countries
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getStudyDegreeString, StudyDegree } from '@/interfaces/study_degree'

countries.registerLocale(enLocale)
const countriesArr = Object.entries(countries.getNames('en', { select: 'alias' })).map(
  ([key, value]) => {
    return {
      label: value,
      value: key,
    }
  },
)

const studyPrograms = translations.university.studyPrograms

interface StudentFormProps {
  student: Student
  disabled?: boolean
  allowEditUniversityData: boolean
  onUpdate: (updatedStudent: Student) => void
}

export const StudentForm = forwardRef<StudentComponentRef, StudentFormProps>(function StudentForm(
  { student, disabled = false, allowEditUniversityData, onUpdate },
  ref,
) {
  const hasUniversityAccount = student.has_university_account

  // this ugly setting is necessary due to typescript and two different validation schema
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
          nationality: student.nationality ?? '',
          study_degree: student.study_degree ?? undefined,
          study_program: student.study_program ?? '',
          current_semester: student.current_semester ?? undefined,
          has_university_account: true,
        }
      : {
          first_name: student.first_name || '',
          last_name: student.last_name || '',
          email: student.email || '',
          gender: student.gender ?? undefined,
          nationality: student.nationality ?? '',
          study_degree: student.study_degree ?? undefined,
          study_program: student.study_program ?? '',
          current_semester: student.current_semester ?? undefined,
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
              nationality: updatedStudent.nationality ?? '',
              study_degree: updatedStudent.study_degree ?? undefined,
              study_program: updatedStudent.study_program ?? '',
              current_semester: updatedStudent.current_semester ?? undefined,
              has_university_account: true,
            }
          : {
              first_name: updatedStudent.first_name || '',
              last_name: updatedStudent.last_name || '',
              email: updatedStudent.email || '',
              gender: updatedStudent.gender ?? undefined,
              nationality: updatedStudent.nationality ?? '',
              study_degree: updatedStudent.study_degree ?? undefined,
              study_program: updatedStudent.study_program ?? '',
              current_semester: updatedStudent.current_semester ?? undefined,
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

  const [otherStudyProgram, setOtherStudyProgram] = useState(false)
  const currStudyProgram = form.watch('study_program')

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
                  <Input
                    {...field}
                    disabled={(!allowEditUniversityData && hasUniversityAccount) || disabled}
                  />
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
                  <Input
                    {...field}
                    disabled={(!allowEditUniversityData && hasUniversityAccount) || disabled}
                  />
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
                <Input
                  {...field}
                  type='email'
                  disabled={(!allowEditUniversityData && hasUniversityAccount) || disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender{requiredStar}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
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
          <FormField
            control={form.control}
            name='nationality'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={disabled}
                      >
                        {field.value
                          ? countriesArr.find((country) => country.value === field.value)?.label
                          : 'Select a nationality'}
                        <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search nationality...' />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countriesArr.map((country) => (
                            <CommandItem
                              value={country.label}
                              key={country.value}
                              onSelect={() => {
                                form.setValue('nationality', country.value)
                              }}
                            >
                              {country.label}
                              <Check
                                className={cn(
                                  'ml-auto',
                                  country.value === field.value ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <FormField
            control={form.control}
            name='study_degree'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Degree{requiredStar}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your current study degree' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(StudyDegree).map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {getStudyDegreeString(degree)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='study_program'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Program{requiredStar}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === 'Other') {
                      setOtherStudyProgram(true)
                      form.setValue('study_program', '')
                    } else {
                      setOtherStudyProgram(false)
                      form.setValue('study_program', value)
                    }
                  }}
                  defaultValue={field.value}
                  disabled={disabled}
                  value={
                    otherStudyProgram || (field.value != '' && !studyPrograms.includes(field.value))
                      ? 'Other'
                      : field.value
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your current study program' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {studyPrograms.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!otherStudyProgram && <FormMessage />}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='current_semester'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Semester{requiredStar}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={disabled}
                    type='number'
                    placeholder='Bachelor (+ Master) Semesters'
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(otherStudyProgram ||
          (currStudyProgram != '' && !studyPrograms.includes(currStudyProgram))) && (
          <FormField
            control={form.control}
            name='study_program'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specify Study Program{requiredStar}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder='Please enter your other study program'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  )
})
