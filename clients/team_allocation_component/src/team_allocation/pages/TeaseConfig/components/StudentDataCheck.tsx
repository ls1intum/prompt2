'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  ClipboardCheck,
  RefreshCcw,
  FileText,
  Laptop,
  MessageSquare,
  Star,
  Languages,
  BarChart3,
} from 'lucide-react'
import type React from 'react'

import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import type { TeaseStudent } from '../../../interfaces/tease/student'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ValidationResult = {
  label: string
  isValid: boolean
  details?: string
  category: 'previous' | 'devices' | 'comments' | 'score' | 'language' | 'survey'
  highLevelCategory: 'previous' | 'survey'
  completionRate: number
  icon: React.ReactNode
}

type StudentCheck = {
  label: string
  extractor: (student: TeaseStudent) => any
  isEmpty: (value: any) => boolean
  missingMessage: string
  userHint: string
  category: 'previous' | 'devices' | 'comments' | 'score' | 'language' | 'survey'
  highLevelCategory: 'previous' | 'survey'
  icon: React.ReactNode
}

const checksConfig: StudentCheck[] = [
  // Data from previous phases
  {
    label: 'First Name',
    extractor: (s) => s.firstName,
    isEmpty: (v) => !v,
    missingMessage: 'first names',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Last Name',
    extractor: (s) => s.lastName,
    isEmpty: (v) => !v,
    missingMessage: 'last names',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Gender',
    extractor: (s) => s.gender,
    isEmpty: (v) => !v,
    missingMessage: 'gender info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Nationality',
    extractor: (s) => s.nationality,
    isEmpty: (v) => !v,
    missingMessage: 'nationality info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Study Degree',
    extractor: (s) => s.studyDegree,
    isEmpty: (v) => !v,
    missingMessage: 'study degree info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Study Program',
    extractor: (s) => s.studyProgram,
    isEmpty: (v) => !v,
    missingMessage: 'study program info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Semester',
    extractor: (s) => s.semester,
    isEmpty: (v) => v === 0,
    missingMessage: 'semester info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },

  // Devices
  {
    label: 'Devices',
    extractor: (s) => s.devices,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'devices information',
    userHint:
      'Include a question about what kind of devices (laptop, tablet) students can use during the course.',
    category: 'devices',
    highLevelCategory: 'previous',
    icon: <Laptop className='h-4 w-4' />,
  },

  // Comments
  {
    label: 'Tutor Comments',
    extractor: (s) => s.tutorComments,
    isEmpty: (arr) => !arr || arr.length === 0,
    missingMessage: 'tutor comments',
    userHint: 'Ensure tutors can provide comments on student performance.',
    category: 'comments',
    highLevelCategory: 'previous',
    icon: <MessageSquare className='h-4 w-4' />,
  },
  {
    label: 'Student Comments',
    extractor: (s) => s.studentComments,
    isEmpty: (arr) => !arr || arr.length === 0,
    missingMessage: 'student comments',
    userHint: 'Allow students to provide feedback or comments.',
    category: 'comments',
    highLevelCategory: 'previous',
    icon: <MessageSquare className='h-4 w-4' />,
  },

  // ScoreLevel
  {
    label: 'Score Level',
    extractor: (s) => s.introCourseProficiency,
    isEmpty: (v) => v === undefined || v === null,
    missingMessage: 'score level information',
    userHint: 'Ensure score levels are assigned to students.',
    category: 'score',
    highLevelCategory: 'previous',
    icon: <Star className='h-4 w-4' />,
  },

  // Language Proficiency
  {
    label: 'English Proficiency',
    extractor: (s) => s.languages?.find((l) => l.language === 'English')?.proficiency,
    isEmpty: (v) => !v,
    missingMessage: 'English proficiency levels',
    userHint:
      'Add application question with possible answers "A1/A2, B1/B2, C1/C2, Native" and export with access key "language_proficiency_english".',
    category: 'language',
    highLevelCategory: 'previous',
    icon: <Languages className='h-4 w-4' />,
  },
  {
    label: 'German Proficiency',
    extractor: (s) => s.languages?.find((l) => l.language === 'German')?.proficiency,
    isEmpty: (v) => !v,
    missingMessage: 'German proficiency levels',
    userHint:
      'Add application question with possible answers "A1/A2, B1/B2, C1/C2, Native" and export with access key "language_proficiency_german".',
    category: 'language',
    highLevelCategory: 'previous',
    icon: <Languages className='h-4 w-4' />,
  },

  // Survey Results
  {
    label: 'Survey Submission',
    extractor: (s) => s.projectPreferences,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'survey submissions',
    userHint: 'Track whether students have submitted the required survey.',
    category: 'survey',
    highLevelCategory: 'survey',
    icon: <BarChart3 className='h-4 w-4' />,
  },
]

const CheckItem = ({ check }: { check: ValidationResult }) => {
  return (
    <Card className={`border-l-4 ${check.isValid ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
      <CardContent className='flex items-center gap-4 p-4'>
        <div className='flex-shrink-0'>
          {check.isValid ? (
            <CheckCircle className='h-6 w-6 text-green-500' />
          ) : (
            <AlertCircle className='h-6 w-6 text-yellow-500' />
          )}
        </div>
        <div className='flex-grow'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {check.icon}
              <h3 className='font-medium'>{check.label}</h3>
            </div>
            <Badge
              variant={check.isValid ? 'default' : 'outline'}
              className={
                check.isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }
            >
              {check.isValid ? 'Complete' : `${check.completionRate}% Complete`}
            </Badge>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {check.details || 'All students have provided this information.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const DataCompletionSummary = ({ checks }: { checks: ValidationResult[] }) => {
  const totalChecks = checks.length
  const completedChecks = checks.filter((check) => check.isValid).length
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100)

  const highLevelCategoryStats = {
    previous: {
      total: checks.filter((c) => c.highLevelCategory === 'previous').length,
      completed: checks.filter((c) => c.highLevelCategory === 'previous' && c.isValid).length,
    },
    survey: {
      total: checks.filter((c) => c.highLevelCategory === 'survey').length,
      completed: checks.filter((c) => c.highLevelCategory === 'survey' && c.isValid).length,
    },
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ClipboardCheck className='h-5 w-5' />
          Data Completion Summary
        </CardTitle>
        <CardDescription>Overall student data completeness and category breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-6'>
          <div className='flex justify-between mb-2'>
            <span className='text-sm font-medium'>Overall Completion</span>
            <span className='text-sm font-medium'>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className='h-2' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='border-amber-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-amber-700 flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Data from Previous Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(
                  (highLevelCategoryStats.previous.completed /
                    highLevelCategoryStats.previous.total) *
                    100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {highLevelCategoryStats.previous.completed} of{' '}
                {highLevelCategoryStats.previous.total} checks complete
              </p>
            </CardContent>
          </Card>

          <Card className='border-teal-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-teal-700 flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Survey Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(
                  (highLevelCategoryStats.survey.completed / highLevelCategoryStats.survey.total) *
                    100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {highLevelCategoryStats.survey.completed} of {highLevelCategoryStats.survey.total}{' '}
                checks complete
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

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
