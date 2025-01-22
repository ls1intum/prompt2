import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { Mail, Copy, EyeOff, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { type CourseMailingFormValues, courseMailingSchema } from '../validations/courseMailing'
import { useSaveMailingData } from './hooks/useSaveMailingData'
import { useParams } from 'react-router-dom'

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
      setIsModified(false)
    }
  }, [applicationMailingMetaData, form])

  async function onSubmit(values: z.infer<typeof courseMailingSchema>) {
    if (currentCourse) {
      const updatedCourse = {
        meta_data: {
          mailingSettings: values,
        },
      }
      mutateMailingData(updatedCourse)
    }
  }

  return (
    <div>
      <ManagementPageHeader>Mailing Settings</ManagementPageHeader>
      <Card className='w-full'>
        <div className='pt-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => setIsModified(true)}>
              <CardContent className='space-y-8'>
                <div>
                  <h3 className='text-lg font-semibold mb-2 flex items-center'>
                    <Mail className='mr-2' size={20} />
                    Replier Information
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    The reply-to email and name will be used for the reply-to field in the mail
                    header.
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                </div>
                <Separator />
                <div>
                  <h3 className='text-lg font-semibold mb-2 flex items-center'>
                    <Copy className='mr-2' size={20} />
                    CC Settings
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    If a CC Email is set, every mail sent by the server (including confirmation and
                    passed/failed mails) for EVERY STUDENT will also be sent to this email address.
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2 flex items-center'>
                    <EyeOff className='mr-2' size={20} />
                    BCC Settings
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    BCC recipients will receive a copy of every email without other recipients
                    knowing.
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                </div>
              </CardContent>
              <CardFooter className='flex justify-end'>
                <Button type='submit' disabled={!isModified} className='w-full sm:w-auto'>
                  <Save className='mr-2 h-4 w-4' />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  )
}
