import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, AlertCircle, Loader2, Users, ClipboardCheck } from 'lucide-react'

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
  category: 'personal' | 'academic' | 'preferences'
  completionRate: number
}

type StudentCheck = {
  label: string
  extractor: (student: TeaseStudent) => any
  isEmpty: (value: any) => boolean
  missingMessage: string
  userHint: string
  category: 'personal' | 'academic' | 'preferences'
}

const checksConfig: StudentCheck[] = [
  {
    label: 'First Name',
    extractor: (s) => s.firstName,
    isEmpty: (v) => !v,
    missingMessage: 'first names',
    userHint: 'Ask students to provide their first name.',
    category: 'personal',
  },
  {
    label: 'Last Name',
    extractor: (s) => s.lastName,
    isEmpty: (v) => !v,
    missingMessage: 'last names',
    userHint: 'Ask students to provide their last name.',
    category: 'personal',
  },
  {
    label: 'Gender',
    extractor: (s) => s.gender,
    isEmpty: (v) => !v,
    missingMessage: 'gender info',
    userHint: "Add a question asking for the student's gender (e.g., for team diversity analysis).",
    category: 'personal',
  },
  {
    label: 'Nationality',
    extractor: (s) => s.nationality,
    isEmpty: (v) => !v,
    missingMessage: 'nationality info',
    userHint: 'Include a question asking students about their nationality.',
    category: 'personal',
  },
  {
    label: 'Study Degree',
    extractor: (s) => s.studyDegree,
    isEmpty: (v) => !v,
    missingMessage: 'study degree info',
    userHint: 'Ask for the degree students are pursuing (e.g., B.Sc., M.Sc.).',
    category: 'academic',
  },
  {
    label: 'Study Program',
    extractor: (s) => s.studyProgram,
    isEmpty: (v) => !v,
    missingMessage: 'study program info',
    userHint: 'Include a field for the exact study program (e.g., Informatics, Data Science).',
    category: 'academic',
  },
  {
    label: 'Semester',
    extractor: (s) => s.semester,
    isEmpty: (v) => v === 0,
    missingMessage: 'semester info',
    userHint: 'Ask students to state which semester they are currently in.',
    category: 'academic',
  },
  {
    label: 'Language Proficiency',
    extractor: (s) => s.languages.every((l) => l.proficiency),
    isEmpty: (v) => !v,
    missingMessage: 'language proficiency info',
    userHint: 'Ensure students provide their proficiency for each language they speak.',
    category: 'academic',
  },
  {
    label: 'Skills',
    extractor: (s) => s.skill,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'skills',
    userHint: 'Ask students to rate their technical and soft skills.',
    category: 'academic',
  },
  {
    label: 'Devices',
    extractor: (s) => s.devices,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'devices',
    userHint:
      'Include a question about what kind of devices (laptop, tablet) students can use during the course.',
    category: 'preferences',
  },
  {
    label: 'Project Preferences',
    extractor: (s) => s.projectPreferences,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'project preferences',
    userHint: "Let students rank or select projects they're most interested in.",
    category: 'preferences',
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
            <h3 className='font-medium'>{check.label}</h3>
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

  const categoryStats = {
    personal: {
      total: checks.filter((c) => c.category === 'personal').length,
      completed: checks.filter((c) => c.category === 'personal' && c.isValid).length,
    },
    academic: {
      total: checks.filter((c) => c.category === 'academic').length,
      completed: checks.filter((c) => c.category === 'academic' && c.isValid).length,
    },
    preferences: {
      total: checks.filter((c) => c.category === 'preferences').length,
      completed: checks.filter((c) => c.category === 'preferences' && c.isValid).length,
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

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='border-green-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-green-700'>Personal Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(
                  (categoryStats.personal.completed / categoryStats.personal.total) * 100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {categoryStats.personal.completed} of {categoryStats.personal.total} checks complete
              </p>
            </CardContent>
          </Card>

          <Card className='border-blue-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-blue-700'>Academic Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(
                  (categoryStats.academic.completed / categoryStats.academic.total) * 100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {categoryStats.academic.completed} of {categoryStats.academic.total} checks complete
              </p>
            </CardContent>
          </Card>

          <Card className='border-purple-100'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-purple-700'>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(
                  (categoryStats.preferences.completed / categoryStats.preferences.total) * 100,
                )}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                {categoryStats.preferences.completed} of {categoryStats.preferences.total} checks
                complete
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

  useEffect(() => {
    if (!students || students.length === 0) return

    const results: ValidationResult[] = checksConfig.map(
      ({ label, extractor, isEmpty, missingMessage, category }) => {
        const validStudents = students.filter((s) => !isEmpty(extractor(s)))
        const completionRate = Math.round((validStudents.length / students.length) * 100)
        const allValid = completionRate === 100
        const noneValid = completionRate === 0

        return {
          label,
          isValid: allValid,
          category,
          completionRate,
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
  const personalChecks = checks.filter((check) => check.category === 'personal')
  const academicChecks = checks.filter((check) => check.category === 'academic')
  const preferenceChecks = checks.filter((check) => check.category === 'preferences')

  return (
    <div className='space-y-6'>
      <DataCompletionSummary checks={checks} />

      <Tabs defaultValue='all' className='w-full'>
        <TabsList className='grid grid-cols-4 mb-4'>
          <TabsTrigger value='all'>All Checks</TabsTrigger>
          <TabsTrigger value='personal'>Personal</TabsTrigger>
          <TabsTrigger value='academic'>Academic</TabsTrigger>
          <TabsTrigger value='preferences'>Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='personal'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                    Personal
                  </Badge>
                  <span>Personal Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {personalChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='academic'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                    Academic
                  </Badge>
                  <span>Academic Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {academicChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='preferences'>
              <AccordionTrigger className='hover:bg-slate-50 px-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-purple-50 text-purple-700 border-purple-200'
                  >
                    Preferences
                  </Badge>
                  <span>Student Preferences</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 pt-2'>
                {preferenceChecks.map((check, index) => (
                  <CheckItem key={index} check={check} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value='personal' className='space-y-6'>
          {personalChecks.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </TabsContent>

        <TabsContent value='academic' className='space-y-6'>
          {academicChecks.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </TabsContent>

        <TabsContent value='preferences' className='space-y-6'>
          {preferenceChecks.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </TabsContent>
      </Tabs>

      <Card>
        <CardFooter className='flex justify-between p-4'>
          <p className='text-sm text-muted-foreground'>
            {students?.length || 0} students in this phase
          </p>
          <Button onClick={() => refetch()} variant='outline' size='sm' className='gap-2'>
            <Loader2 className='h-4 w-4' />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default StudentDataCheck
