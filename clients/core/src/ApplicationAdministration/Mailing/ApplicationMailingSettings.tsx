import { useEffect, useState } from 'react'
import { useGetCoursePhase } from '../handlers/useGetCoursePhase'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'
import { parseApplicationMailingMetaData } from './utils/parseApplicaitonMailingMetaData'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import MinimalTiptapEditor from '@/components/minimal-tiptap/minimal-tiptap'
import { useModifyCoursePhase } from '../handlers/useModifyCoursePhase'
import { useToast } from '@/hooks/use-toast'
import { UpdateCoursePhase } from '@/interfaces/course_phase'
import { useParams } from 'react-router-dom'
import { AvailableMailPlaceholders } from './components/AvailableMailPlaceholders'
import { Input } from '@/components/ui/input'

export const ApplicationMailingSettings = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { toast } = useToast()

  const [emailError, setEmailError] = useState<string | null>(null)
  const [initialMetaData, setInitialMetaData] = useState<ApplicationMailingMetaData | null>(null)
  const [applicationMailingMetaData, setApplicationMailingMetaData] =
    useState<ApplicationMailingMetaData>({
      confirmationMailSubject: '',
      confirmationMail: '',
      rejectionMailSubject: '',
      rejectionMail: '',
      acceptanceMailSubject: '',
      acceptanceMail: '',
      sendConfirmationMail: false,
      sendRejectionMail: false,
      sendAcceptanceMail: false,

      replyToEmail: '',
      replyToName: '',
    })

  const isModified = JSON.stringify(initialMetaData) !== JSON.stringify(applicationMailingMetaData)
  // Fetching meta data
  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    error: coursePhaseError,
    isError: isCoursePhaseError,
  } = useGetCoursePhase()

  // Updating state
  const { mutate: mutateCoursePhase } = useModifyCoursePhase(
    () => {
      toast({
        title: 'Application mailing settings updated',
      })
    },
    () => {
      toast({
        title: 'Error updating application mailing settings',
        description: 'Please try again later',
        variant: 'destructive',
      })
    },
  )

  useEffect(() => {
    if (fetchedCoursePhase?.meta_data) {
      const parsedMetaData = parseApplicationMailingMetaData(fetchedCoursePhase.meta_data)
      setApplicationMailingMetaData(parsedMetaData)
      setInitialMetaData(parsedMetaData)
    }
  }, [fetchedCoursePhase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log('Event name:', name)
    setApplicationMailingMetaData((prev) => ({ ...prev, [name]: value }))

    if (name === 'replyToEmail') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        setEmailError('Reply To Email is required.')
      } else if (!emailPattern.test(value)) {
        setEmailError('Please enter a valid email address.')
      } else {
        setEmailError(null)
      }
    }
  }

  const handleSwitchChange = (name: string) => {
    setApplicationMailingMetaData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof ApplicationMailingMetaData],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // get all the values
    if (emailError) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      })
      return
    }

    const updatedCoursePhase: UpdateCoursePhase = {
      id: phaseId ?? '',
      meta_data: {
        mailingConfig: applicationMailingMetaData,
      },
    }
    mutateCoursePhase(updatedCoursePhase)
    console.log('Saving:', applicationMailingMetaData)
  }

  if (isCoursePhasePending) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (isCoursePhaseError) {
    return (
      <div className='text-red-500'>
        Error: {coursePhaseError?.message || 'An error occurred while fetching course phase data.'}
      </div>
    )
  }

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Application Mailing Settings</CardTitle>
        <CardDescription>Configure email settings for the application phase</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Automatic Email Sending</h3>
            <div className='flex items-center space-x-2'>
              <Switch
                id='sendConfirmationMail'
                checked={applicationMailingMetaData.sendConfirmationMail}
                onCheckedChange={() => handleSwitchChange('sendConfirmationMail')}
              />
              <Label htmlFor='sendConfirmationMail'>Send Confirmation Email</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='sendRejectionMail'
                disabled={true}
                checked={applicationMailingMetaData.sendRejectionMail}
                onCheckedChange={() => handleSwitchChange('sendRejectionMail')}
              />
              <Label htmlFor='sendRejectionMail'>Send Rejection Email</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='sendAcceptanceMail'
                disabled={true}
                checked={applicationMailingMetaData.sendAcceptanceMail}
                onCheckedChange={() => handleSwitchChange('sendAcceptanceMail')}
              />
              <Label htmlFor='sendAcceptanceMail'>Send Acceptance Email</Label>
            </div>
          </div>

          <div className='space-y-4 mb-4 columns-2'>
            <div>
              <Label htmlFor='replyToEmail'>Reply To Email</Label>
              <Input
                type='email'
                name='replyToEmail'
                placeholder='i.e. course@management.de'
                value={applicationMailingMetaData.replyToEmail}
                onChange={(e) => handleInputChange(e)}
                className='w-full mt-1 p-2 border rounded'
              />
              {emailError && <p className='text-red-500 p-2 text-sm'>{emailError}</p>}
            </div>
            <div>
              <Label htmlFor='replyToName'>Replier Name</Label>
              <Input
                type='text'
                name='replyToName'
                placeholder='i.e. Course Management'
                value={applicationMailingMetaData.replyToName}
                onChange={(e) => handleInputChange(e)}
                className='w-full mt-1 p-2 border rounded'
              />
            </div>
          </div>

          <AvailableMailPlaceholders />
          {/* ensures that tiptap editor is only loaded after receiving meta data */}
          {initialMetaData && (
            <Tabs defaultValue='confirmation' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='confirmation'>Confirmation</TabsTrigger>
                <TabsTrigger value='rejection'>Rejection</TabsTrigger>
                <TabsTrigger value='acceptance'>Acceptance</TabsTrigger>
              </TabsList>
              <TabsContent value='confirmation'>
                <div className='space-y-2'>
                  <Label htmlFor='confirmationMailSubject'>Confirmation Subject</Label>
                  <Input
                    type='text'
                    name='confirmationMailSubject'
                    value={applicationMailingMetaData.confirmationMailSubject}
                    onChange={(e) => handleInputChange(e)}
                    className='w-full mt-1 p-2 border rounded'
                  />
                  <Label htmlFor='confirmationMail'>Confirmation Email Template</Label>
                  <TooltipProvider>
                    <MinimalTiptapEditor
                      value={applicationMailingMetaData.confirmationMail}
                      onChange={(content) =>
                        handleInputChange({
                          target: { name: 'confirmationMail', value: content },
                        } as any)
                      }
                      className='w-full'
                      editorContentClassName='p-4'
                      output='html'
                      placeholder='Type your description here...'
                      autofocus={false}
                      editable={true}
                      editorClassName='focus:outline-none'
                    />
                  </TooltipProvider>
                </div>
              </TabsContent>
              <TabsContent value='rejection'>
                <div className='space-y-2'>
                  <Label htmlFor='rejectionMailSubject'>Rejection Subject</Label>
                  <Input
                    type='text'
                    name='rejectionMailSubject'
                    value={applicationMailingMetaData.rejectionMailSubject}
                    onChange={(e) => handleInputChange(e)}
                    className='w-full mt-1 p-2 border rounded'
                  />
                  <Label htmlFor='rejectionMail'>Rejection Email Template</Label>
                  <TooltipProvider>
                    <MinimalTiptapEditor
                      value={applicationMailingMetaData.rejectionMail}
                      onChange={(content) =>
                        handleInputChange({
                          target: { name: 'rejectionMail', value: content },
                        } as any)
                      }
                      className='w-full'
                      editorContentClassName='p-4'
                      output='html'
                      placeholder='Type your description here...'
                      autofocus={false}
                      editable={true}
                      editorClassName='focus:outline-none'
                    />
                  </TooltipProvider>
                </div>
              </TabsContent>
              <TabsContent value='acceptance'>
                <div className='space-y-2'>
                  <Label htmlFor='acceptanceMailSubject'>Acceptance Subject</Label>
                  <Input
                    type='text'
                    name='acceptanceMailSubject'
                    value={applicationMailingMetaData.acceptanceMailSubject}
                    onChange={(e) => handleInputChange(e)}
                    className='w-full mt-1 p-2 border rounded'
                  />
                  <Label htmlFor='acceptanceMail'>Acceptance Email Template</Label>
                  <TooltipProvider>
                    <MinimalTiptapEditor
                      value={applicationMailingMetaData.acceptanceMail}
                      onChange={(content) =>
                        handleInputChange({
                          target: { name: 'acceptanceMail', value: content },
                        } as any)
                      }
                      className='w-full'
                      editorContentClassName='p-4'
                      output='html'
                      placeholder='Type your description here...'
                      autofocus={false}
                      editable={true}
                      editorClassName='focus:outline-none'
                    />
                  </TooltipProvider>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter>
          <Button type='submit' className='ml-auto' disabled={!isModified}>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
