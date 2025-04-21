import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Users, RefreshCcw } from 'lucide-react'

import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import type { TeaseStudent } from '../../../interfaces/tease/student'
import type { ValidationResult } from '../../../interfaces/validationResult'
import DataCompletionSummary from './DataCompletionSummary'
import { CheckItem } from './CheckItem'
import { checksConfig } from './ChecksConfig'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const StudentDataCheck = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: students,
    isPending,
    isError,
    refetch,
  } = useQuery<TeaseStudent[]>({
    queryKey: ['tease_students', phaseId],
    queryFn: () => getAllTeaseStudents(phaseId ?? ''),
  })

  const [checks, setChecks] = useState<ValidationResult[] | null>(null)

  const numberOfStudentsSubmitted =
    students?.filter((s) => s.projectPreferences.length > 0).length || 0

  useEffect(() => {
    if (!students || students.length === 0) return

    const results: ValidationResult[] = checksConfig.map(
      ({ label, extractor, isEmpty, missingMessage, category, icon, highLevelCategory }) => {
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
            ? undefined
            : noneValid
              ? `No students have ${missingMessage}. Please check if your previous course phases (e.g. application)
                forward information on ${missingMessage} to this phase.`
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
  const previousChecks = checks.filter((check) => check.category === 'previous')
  const deviceChecks = checks.filter((check) => check.category === 'devices')
  const commentChecks = checks.filter((check) => check.category === 'comments')
  const scoreChecks = checks.filter((check) => check.category === 'score')
  const languageChecks = checks.filter((check) => check.category === 'language')
  const surveyChecks = checks.filter((check) => check.category === 'survey')

  return (
    <div className='space-y-6'>
      <DataCompletionSummary checks={checks} />

      <Tabs defaultValue='all' className='w-full'>
        <TabsList className='grid grid-cols-3 mb-4'>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='previous'>Previous Phases</TabsTrigger>
          <TabsTrigger value='survey'>Survey Results</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='previous'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200'>
                    Previous
                  </Badge>
                  <span>Data from Previous Phases</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-4 pt-2'>
                <Accordion type='single' collapsible className='w-full'>
                  <AccordionItem value='basic-info'>
                    <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='bg-amber-50 text-amber-700 border-amber-200'
                        >
                          Basic
                        </Badge>
                        <span>Basic Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-6 pt-2'>
                      {previousChecks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value='devices'>
                    <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='bg-gray-50 text-gray-700 border-gray-200'
                        >
                          Devices
                        </Badge>
                        <span>Student Devices</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-6 pt-2'>
                      {deviceChecks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value='comments'>
                    <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='bg-purple-50 text-purple-700 border-purple-200'
                        >
                          Comments
                        </Badge>
                        <span>Tutor & Student Comments</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-6 pt-2'>
                      {commentChecks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value='score'>
                    <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='bg-yellow-50 text-yellow-700 border-yellow-200'
                        >
                          Score
                        </Badge>
                        <span>Score Level</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-6 pt-2'>
                      {scoreChecks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value='language'>
                    <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-700 border-blue-200'
                        >
                          Language
                        </Badge>
                        <span>Language Proficiency</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='space-y-6 pt-2'>
                      {languageChecks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                      ))}
                      <Card className='bg-blue-50 border-blue-200'>
                        <CardContent className='p-4 text-sm'>
                          <p className='font-medium text-blue-800'>Important:</p>
                          <p className='text-blue-700 mt-1'>
                            Language proficiency must be added as application questions with
                            possible answers &quot;A1/A2, B1/B2, C1/C2, Native&quot; and exported
                            with access keys &quot;language_proficiency_german&quot; and
                            &quot;language_proficiency_english&quot;.
                          </p>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='survey'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-teal-50 text-teal-700 border-teal-200'>
                    Survey
                  </Badge>
                  <span>Survey Results</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {surveyChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
                <Card className='bg-teal-50 border-teal-200'>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-teal-800'>Survey Submissions:</span>
                      <Badge variant='outline' className='bg-teal-100 text-teal-800'>
                        {numberOfStudentsSubmitted} of {students?.length || 0} students
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value='previous' className='space-y-4'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='basic-info'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200'>
                    Basic
                  </Badge>
                  <span>Basic Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {previousChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='devices'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-gray-50 text-gray-700 border-gray-200'>
                    Devices
                  </Badge>
                  <span>Student Devices</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {deviceChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='comments'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-purple-50 text-purple-700 border-purple-200'
                  >
                    Comments
                  </Badge>
                  <span>Tutor & Student Comments</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {commentChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='score'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-yellow-50 text-yellow-700 border-yellow-200'
                  >
                    Score
                  </Badge>
                  <span>Score Level</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {scoreChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='language'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                    Language
                  </Badge>
                  <span>Language Proficiency</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {languageChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
                <Card className='bg-blue-50 border-blue-200'>
                  <CardContent className='p-4 text-sm'>
                    <p className='font-medium text-blue-800'>Important:</p>
                    <p className='text-blue-700 mt-1'>
                      Language proficiency must be added as application questions with possible
                      answers &quot;A1/A2, B1/B2, C1/C2, Native&quot; and exported with access keys
                      &quot;language_proficiency_german&quot; and
                      &quot;language_proficiency_english&quot;.
                    </p>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value='survey' className='space-y-6'>
          {surveyChecks.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
          <Card className='bg-teal-50 border-teal-200'>
            <CardContent className='p-4'>
              <div className='flex justify-between items-center'>
                <span className='font-medium text-teal-800'>Survey Submissions:</span>
                <Badge variant='outline' className='bg-teal-100 text-teal-800'>
                  {numberOfStudentsSubmitted} of {students?.length || 0} students
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardFooter className='flex justify-between p-4'>
          <p className='text-sm text-muted-foreground'>
            {students?.length || 0} students in this phase
          </p>
          <Button
            onClick={() => refetch()}
            variant='outline'
            size='sm'
            className='gap-2'
            disabled={isPending}
          >
            <RefreshCcw className={`h-5 w-5 ${isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
      {!checks?.every((c) => c.isValid) && (
        <p className='text-sm text-muted-foreground mt-2 text-left'>
          <span className='font-semibold'>
            Please ensure all student data fields are completed before proceeding to TEASE!{' '}
          </span>
        </p>
      )}
      <div className='mt-4 w-full'>
        {checks?.every((c) => c.isValid) ? (
          <Button asChild className='gap-2 w-full'>
            <a href='https://prompt.aet.cit.tum.de/tease' target='_blank' rel='noopener noreferrer'>
              Go to TEASE
            </a>
          </Button>
        ) : (
          <Button disabled className='gap-2 w-full'>
            Go to TEASE
          </Button>
        )}
      </div>
    </div>
  )
}

export default StudentDataCheck
