import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'
import { useToast } from '@/hooks/use-toast'
import { CoursePhaseWithMetaData, UpdateCoursePhase } from '@/interfaces/course_phase'
import { AvailableMailPlaceholders } from './components/AvailableMailPlaceholders'
import { EmailTemplateEditor } from './components/MailingEditor'
import { SettingsCard } from './components/SettingsCard'
import { CoursePhaseMailingConfigData } from '@/interfaces/coursePhaseMailingConfigData'

interface CoursePhaseMailingProps {
  coursePhase: CoursePhaseWithMetaData | undefined
}

export const CoursePhaseMailing = ({ coursePhase }: CoursePhaseMailingProps) => {
  const { toast } = useToast()
  const [initialMetaData, setInitialMetaData] = useState<CoursePhaseMailingConfigData | null>(null)
  const [mailingMetaData, setMailingMetaData] = useState<CoursePhaseMailingConfigData>({
    failedMailSubject: '',
    failedMailContent: '',
    passedMailSubject: '',
    passedMailContent: '',
  })

  const isModified = JSON.stringify(initialMetaData) !== JSON.stringify(mailingMetaData)

  // TODO: re-integrate once the shared library is implemented!!
  //   const courseMailingIsConfigured = useGetMailingIsConfigured()
  //   const [missingConfigs, setMissingConfigs] = useState<MissingConfigItem[]>([])

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
      const parsedMetaData = coursePhase.meta_data.mailingSettings as CoursePhaseMailingConfigData
      console.log(parsedMetaData)
      if (!parsedMetaData) {
        const emptyMailData = {
          failedMailSubject: '',
          failedMailContent: '',
          passedMailSubject: '',
          passedMailContent: '',
        }
        setMailingMetaData(emptyMailData)
        setInitialMetaData(emptyMailData)
      } else {
        setMailingMetaData(parsedMetaData)
        setInitialMetaData(parsedMetaData)
      }
    }
  }, [coursePhase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMailingMetaData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedCoursePhase: UpdateCoursePhase = {
      id: coursePhase?.id ?? '',
      meta_data: {
        mailingSettings: mailingMetaData,
      },
    }
    mutateCoursePhase(updatedCoursePhase)
  }

  // TODO: re-integrate once the shared library is implemented!!
  //   useEffect(() => {
  //     if (!courseMailingIsConfigured) {
  //       setMissingConfigs([
  //         {
  //           title: 'Application Mailing',
  //           description: 'Please configure course mailing settings',
  //           link: `/management/course/${courseId}/mailing`,
  //           icon: MailWarningIcon,
  //         },
  //       ])
  //     }
  //   }, [courseId, courseMailingIsConfigured])

  return (
    <div className='space-y-6'>
      {/* <MissingConfig elements={missingConfigs} /> */}
      <SettingsCard mailingMetaData={mailingMetaData} isModified={isModified} />
      <h2 className='text-2xl font-bold'>Mailing Templates </h2>

      <AvailableMailPlaceholders />
      {/* ensures that tiptap editor is only loaded after receiving meta data */}
      {initialMetaData && (
        <Tabs defaultValue='pass' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='pass'>1. Passed Students</TabsTrigger>
            <TabsTrigger value='failed'>2. Failed students</TabsTrigger>
          </TabsList>
          <TabsContent value='pass'>
            <EmailTemplateEditor
              subject={mailingMetaData.passedMailSubject || ''}
              content={mailingMetaData.passedMailContent || ''}
              onInputChange={handleInputChange}
              label='Passed'
              subjectHTMLLabel='passedMailSubject'
              contentHTMLLabel='passedMailContent'
            />
          </TabsContent>
          <TabsContent value='failed'>
            <EmailTemplateEditor
              subject={mailingMetaData.failedMailSubject || ''}
              content={mailingMetaData.failedMailContent || ''}
              onInputChange={handleInputChange}
              label='Failed'
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
