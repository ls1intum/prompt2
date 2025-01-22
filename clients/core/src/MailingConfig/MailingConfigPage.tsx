import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ManagementPageHeader } from '../management/components/ManagementPageHeader'
import { useCourseStore } from '@/zustand/useCourseStore'
import type { MailingMetaData } from './interfaces/MailingMetaData'
import { CourseMailingFormValues, courseMailingSchema } from '../validations/courseMailing'
import { useSaveMailingData } from './hooks/useSaveMailingData'

export const MailingConfigPage = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const currentCourse = courses.find((course) => course.id === courseId)
  const applicationMailingMetaData = currentCourse?.meta_data.mailingSettings as MailingMetaData
  const [isModified, setIsModified] = useState(false)

  const { mutate: mutateMailingData } = useSaveMailingData()

  const form = useForm<CourseMailingFormValues>({
    resolver: zodResolver(courseMailingSchema),
    defaultValues: {
      replyToName: '',
      replyToEmail: '',
      ccName: '',
      ccEmail: '',
      bccName: '',
      bccEmail: '',
    },
  })

  useEffect(() => {
    if (applicationMailingMetaData) {
      form.reset(applicationMailingMetaData)
    }
  }, [applicationMailingMetaData, form])

  function onSubmit(values: z.infer<typeof courseMailingSchema>) {
    if (currentCourse) {
      const updatedCourse = {
        meta_data: {
          mailingSettings: values,
        },
      }
      mutateMailingData(updatedCourse)
      setIsModified(false)
    }
  }

  return (
    <div>
      <ManagementPageHeader>Mailing Settings</ManagementPageHeader>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Sender Information</CardTitle>
            {isModified && (
              <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-300'>
                Unsaved Changes
              </Badge>
            )}
          </div>
          <CardDescription>
            These settings will be applied to all course phases in this course.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => setIsModified(true)}>
            <CardContent className='space-y-6'>
              <CardTitle>Replier Information</CardTitle>
              <CardDescription>
                The reply to email and name will be used for the reply-to field in the mail header.
              </CardDescription>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='replyToEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply To Email</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. course@management.de' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='replyToName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Replier Name</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. Course Management' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <CardTitle>CC / BCC Settings</CardTitle>
              <CardDescription>
                If a CC Email is set, every mail sent by the server (including confirmation and
                passed/failed mails) for EVERY STUDENT will also be sent to this email address.
              </CardDescription>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='ccEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CC Email</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. cc@management.de' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ccName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CC Name</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. CC Recipient' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='bccEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BCC Email</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. bcc@management.de' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='bccName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BCC Name</FormLabel>
                      <FormControl>
                        <Input placeholder='i.e. BCC Recipient' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type='submit' disabled={!isModified}>
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
