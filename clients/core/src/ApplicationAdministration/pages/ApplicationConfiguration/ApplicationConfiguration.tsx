import { useEffect, useState } from 'react'
import { Loader2, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { CoursePhaseWithMetaData } from '@/interfaces/course_phase'
import { ApplicationTimeline } from './components/ApplicationTimeline'
import { ApplicationConfigurationHeader } from './components/ConfigurationHeader'
import { ExternalStudentsStatus } from './components/ExternalStudentsAllowed'
import { ApplicationMetaData } from '../../interfaces/ApplicationMetaData'
import { getApplicationStatus } from '../../utils/getApplicationStatus'
import { ApplicationConfigDialog } from './components/ApplicationConfigDialog'
import { ApplicationQuestionConfig } from './ApplicationQuestionConfig/ApplicationQuestionConfig'
import { useGetCoursePhase } from '../../hooks/useGetCoursePhase'
import { getIsApplicationConfigured } from '../../utils/getApplicationIsConfigured'
import { useParseApplicationMetaData } from '../../hooks/useParseApplicationMetaData'

export const ApplicationConfiguration = (): JSX.Element => {
  const [coursePhase, setCoursePhase] = useState<CoursePhaseWithMetaData | undefined>(undefined)
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    error: coursePhaseError,
    isError: isCoursePhaseError,
  } = useGetCoursePhase()

  useEffect(() => {
    if (fetchedCoursePhase) {
      setCoursePhase(fetchedCoursePhase)
    }
  }, [fetchedCoursePhase])

  useParseApplicationMetaData(coursePhase, setApplicationMetaData)

  const applicationPhaseIsConfigured = getIsApplicationConfigured(applicationMetaData)

  const applicationStatus = getApplicationStatus(applicationMetaData, applicationPhaseIsConfigured)

  if (isCoursePhasePending) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardContent className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  if (isCoursePhaseError) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardContent className='p-6'>
          <p className='text-red-500'>
            Error: {coursePhaseError?.message || 'Failed to load course phase'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleModifyConfiguration = () => {
    setIsConfigDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsConfigDialogOpen(false)
  }

  return (
    <div className='container mx-auto space-y-8'>
      <h1 className='text-4xl font-bold text-center mb-8'>Application Configuration</h1>
      <Card className='w-full max-w-4xl mx-auto shadow-lg'>
        <ApplicationConfigurationHeader
          applicationPhaseIsConfigured={applicationPhaseIsConfigured ?? false}
          applicationStatus={applicationStatus}
        />
        <CardContent className='space-y-6'>
          {applicationPhaseIsConfigured ? (
            <>
              <ApplicationTimeline
                startDate={applicationMetaData?.applicationStartDate}
                endDate={applicationMetaData?.applicationEndDate}
              />
              <ExternalStudentsStatus
                externalStudentsAllowed={applicationMetaData?.externalStudentsAllowed ?? false}
              />
              <div className='flex justify-end'>
                <Button onClick={handleModifyConfiguration} variant='outline'>
                  <Settings className='mr-2 h-4 w-4' />
                  Modify Configuration
                </Button>
              </div>
            </>
          ) : (
            <div className='text-center py-8'>
              <p className='text-xl mb-4'>The application phase is not yet configured.</p>
              <Button onClick={handleModifyConfiguration} size='lg'>
                <Settings className='mr-2 h-5 w-5' />
                Configure Application Phase
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {applicationPhaseIsConfigured && <ApplicationQuestionConfig />}

      {applicationMetaData && (
        <ApplicationConfigDialog
          isOpen={isConfigDialogOpen}
          onClose={handleDialogClose}
          initialData={applicationMetaData}
        />
      )}
    </div>
  )
}
