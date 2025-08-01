import { useEffect, useState } from 'react'
import { useModifyCoursePhase } from '@/hooks/useModifyCoursePhase'
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@tumaet/prompt-ui-components'
import {
  CoursePhaseWithMetaData,
  UpdateCoursePhase,
  CoursePhaseMailingConfigData,
} from '@tumaet/prompt-shared-state'
import {
  AvailableMailPlaceholders,
  availablePlaceholders,
} from './components/AvailableMailPlaceholders'
import { EmailTemplateEditor } from './components/MailingEditor'
import { SettingsCard } from './components/SettingsCard'
import { useGetMailingIsConfigured } from '@/hooks/useGetMailingIsConfigured'
import { MissingConfig, MissingConfigItem } from '@/components/MissingConfig'
import { MailWarningIcon } from 'lucide-react'
import { useParams } from 'react-router-dom'

interface CoursePhaseMailingProps {
  coursePhase: CoursePhaseWithMetaData | undefined
}

export const CoursePhaseMailing = ({ coursePhase }: CoursePhaseMailingProps) => {
  const { courseId } = useParams<{ courseId: string }>()
  const { toast } = useToast()
  const [initialMetaData, setInitialMetaData] = useState<CoursePhaseMailingConfigData | null>(null)
  const [mailingMetaData, setMailingMetaData] = useState<CoursePhaseMailingConfigData>({
    failedMailSubject: '',
    failedMailContent: '',
    passedMailSubject: '',
    passedMailContent: '',
  })

  const isModified = JSON.stringify(initialMetaData) !== JSON.stringify(mailingMetaData)

  const courseMailingIsConfigured = useGetMailingIsConfigured()
  const [missingConfigs, setMissingConfigs] = useState<MissingConfigItem[]>([])

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
    if (coursePhase?.restrictedData) {
      const parsedMetaData = coursePhase.restrictedData
        .mailingSettings as CoursePhaseMailingConfigData
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
      restrictedData: {
        mailingSettings: mailingMetaData,
      },
    }
    mutateCoursePhase(updatedCoursePhase)
  }

  useEffect(() => {
    if (!courseMailingIsConfigured) {
      setMissingConfigs([
        {
          title: 'Application Mailing',
          description: 'Please configure course mailing settings',
          link: `/management/course/${courseId}/settings`,
          icon: MailWarningIcon,
        },
      ])
    }
  }, [courseId, courseMailingIsConfigured])

  return (
    <div className='space-y-6'>
      <MissingConfig elements={missingConfigs} />
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
              placeholders={availablePlaceholders.map((placeholder) => placeholder.placeholder)}
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
              placeholders={availablePlaceholders.map((placeholder) => placeholder.placeholder)}
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
