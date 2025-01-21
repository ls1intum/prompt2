import { useEffect, useState } from 'react'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'
import { parseApplicationMailingMetaData } from './utils/parseApplicaitonMailingMetaData'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModifyCoursePhase } from '../../hooks/useModifyCoursePhase'
import { useToast } from '@/hooks/use-toast'
import { UpdateCoursePhase } from '@/interfaces/course_phase'
import { useParams } from 'react-router-dom'
import { AvailableMailPlaceholders } from './components/AvailableMailPlaceholders'
import { EmailTemplateEditor } from './components/MailingEditor'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { SettingsCard } from './components/SettingsCard'
import { useApplicationStore } from '../../zustand/useApplicationStore'

export const ApplicationMailingSettings = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { toast } = useToast()
  const { coursePhase } = useApplicationStore()
  const [emailError, setEmailError] = useState<string | null>(null)
  const [initialMetaData, setInitialMetaData] = useState<ApplicationMailingMetaData | null>(null)
  const [applicationMailingMetaData, setApplicationMailingMetaData] =
    useState<ApplicationMailingMetaData>({
      confirmationMailSubject: '',
      confirmationMailContent: '',
      failedMailSubject: '',
      failedMailContent: '',
      passedMailSubject: '',
      passedMailContent: '',
      sendConfirmationMail: false,
      sendRejectionMail: false,
      sendAcceptanceMail: false,

      replyToEmail: '',
      replyToName: '',
    })

  const isModified = JSON.stringify(initialMetaData) !== JSON.stringify(applicationMailingMetaData)

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
    if (coursePhase?.meta_data) {
      const parsedMetaData = parseApplicationMailingMetaData(coursePhase.meta_data)
      setApplicationMailingMetaData(parsedMetaData)
      setInitialMetaData(parsedMetaData)
    }
  }, [coursePhase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

  return (
    <div className='space-y-6'>
      <ManagementPageHeader>Application Mailing Settings</ManagementPageHeader>
      <SettingsCard
        applicationMailingMetaData={applicationMailingMetaData}
        handleInputChange={handleInputChange}
        handleSwitchChange={handleSwitchChange}
        isModified={isModified}
        emailError={emailError}
      />
      <h2 className='text-2xl font-bold'>Mailing Templates </h2>

      <AvailableMailPlaceholders />
      {/* ensures that tiptap editor is only loaded after receiving meta data */}
      {initialMetaData && (
        <Tabs defaultValue='confirmation' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='confirmation'>1. Confirmation</TabsTrigger>
            <TabsTrigger value='acceptance'>2. Acceptance</TabsTrigger>
            <TabsTrigger value='rejection'>3. Rejection</TabsTrigger>
          </TabsList>
          <TabsContent value='confirmation'>
            <EmailTemplateEditor
              subject={applicationMailingMetaData.confirmationMailSubject}
              content={applicationMailingMetaData.confirmationMailContent}
              onInputChange={handleInputChange}
              label='Confirmation'
              subjectHTMLLabel='confirmationMailSubject'
              contentHTMLLabel='confirmationMailContent'
            />
          </TabsContent>
          <TabsContent value='acceptance'>
            <EmailTemplateEditor
              subject={applicationMailingMetaData.passedMailSubject}
              content={applicationMailingMetaData.passedMailContent}
              onInputChange={handleInputChange}
              label='Acceptance'
              subjectHTMLLabel='passedMailSubject'
              contentHTMLLabel='passedMailContent'
            />
          </TabsContent>
          <TabsContent value='rejection'>
            <EmailTemplateEditor
              subject={applicationMailingMetaData.failedMailSubject}
              content={applicationMailingMetaData.failedMailContent}
              onInputChange={handleInputChange}
              label='Rejection'
              subjectHTMLLabel='failedMailSubject'
              contentHTMLLabel='failedMailContent'
            />
          </TabsContent>
        </Tabs>
      )}

      <div className='justify-end flex'>
        <Button onClick={handleSubmit} type='submit' className='ml-auto' disabled={!isModified}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
