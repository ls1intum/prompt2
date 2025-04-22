import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import type { TeaseStudent } from '../../../interfaces/tease/student'
import type { ValidationResult } from '../../../interfaces/validationResult'
import DataCompletionSummary from './DataCompletionSummary'
import { CheckItem } from './CheckItem'
import { checksConfig } from './ChecksConfig'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SurveySubmissionOverview from './SurveySubmissionOverview'

export const StudentDataCheck = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const [checks, setChecks] = useState<ValidationResult[] | null>(null)

  const {
    data: students,
    isPending,
    isError,
    refetch,
  } = useQuery<TeaseStudent[]>({
    queryKey: ['tease_students', phaseId],
    queryFn: () => getAllTeaseStudents(phaseId ?? ''),
  })

  const numberOfStudentsSubmitted =
    students?.filter((s) => s.projectPreferences.length > 0).length || 0
  const numberOfStudents = students?.length || 0

  useEffect(() => {
    if (!students || students.length === 0) return

    const results: ValidationResult[] = checksConfig.map(
      ({
        label,
        extractor,
        isEmpty,
        missingMessage,
        problemDescription,
        userHint,
        category,
        icon,
        highLevelCategory,
      }) => {
        const validStudents = students.filter((s) => !isEmpty(extractor(s)))
        const completionRate = Math.round((validStudents.length / students.length) * 100)
        const allValid = completionRate === 100
        const noneValid = completionRate === 0

        return {
          label,
          isValid: allValid,
          category,
          highLevelCategory,
          completionRate,
          icon,
          details: allValid
            ? userHint
            : noneValid
              ? `${problemDescription}`
              : `${validStudents.length} of ${students.length} students have provided ${missingMessage}.`,
        }
      },
    )

    setChecks(results)
  }, [students])

  if (isPending) {
    return (
      <div className='flex flex-col items-center justify-center h-64 space-y-4'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
        <p className='text-muted-foreground'>Loading student data...</p>
        <div className='w-full max-w-md'>
          <Skeleton className='h-4 w-full mb-2' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className='border-red-200 bg-red-50'>
        <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-medium mb-2'>Failed to load student data</h3>
          <p className='text-muted-foreground mb-4'>
            There was an error retrieving the student information. Please try again.
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!checks || checks.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-medium mb-2'>No student data available</h3>
          <p className='text-muted-foreground'>
            There are no students enrolled in this phase yet, or the data hasn`t been loaded.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group checks by category
  const deviceChecks = checks.filter((check) => check.category === 'devices')
  const commentChecks = checks.filter((check) => check.category === 'comments')
  const scoreChecks = checks.filter((check) => check.category === 'score')
  const languageChecks = checks.filter((check) => check.category === 'language')

  return (
    <div className='space-y-6'>
      <DataCompletionSummary
        checks={checks}
        students={students}
        isLoading={isPending}
        isError={isError}
      />

      <Tabs defaultValue='previous' className='w-full'>
        <TabsList className='grid grid-cols-2 mb-4'>
          <TabsTrigger value='previous'>Previous Phases</TabsTrigger>
          <TabsTrigger value='survey'>Survey Results</TabsTrigger>
        </TabsList>

        <TabsContent value='previous' className='space-y-4'>
          <div className='space-y-6'>
            {deviceChecks.map((check, index) => (
              <CheckItem key={index} check={check} />
            ))}
          </div>

          <div className='space-y-6'>
            {commentChecks.map((check, index) => (
              <CheckItem key={index} check={check} />
            ))}
          </div>

          <div className='space-y-6'>
            {scoreChecks.map((check, index) => (
              <CheckItem key={index} check={check} />
            ))}
          </div>

          <div className='space-y-6'>
            {languageChecks.map((check, index) => (
              <CheckItem key={index} check={check} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value='survey' className='space-y-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium mb-2'>Survey Submission Status</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              {numberOfStudentsSubmitted} of {numberOfStudents} students have submitted their survey
              ({Math.round((numberOfStudentsSubmitted / numberOfStudents) * 100)}%)
            </p>
            <SurveySubmissionOverview students={students || []} />
          </div>
        </TabsContent>
      </Tabs>

      {!checks?.every((c) => c.isValid) && (
        <p className='text-sm text-muted-foreground mt-2 text-left'>
          <span className='font-semibold'>
            Please ensure all student data fields are completed before proceeding to TEASE!{' '}
          </span>
        </p>
      )}
      <div className='mt-4 w-full'>
        <>
          <Button asChild className='gap-2 w-full'>
            <Link to={`/tease`}>
              Go to TEASE
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </>
      </div>
    </div>
  )
}

export default StudentDataCheck
