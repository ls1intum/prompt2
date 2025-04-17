import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import { TeaseStudent } from 'src/team_allocation/interfaces/tease/student'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorPage } from '@/components/ErrorPage'

type ValidationResult = {
  label: string
  isValid: boolean
  details?: string
}

type StudentCheck = {
  label: string
  extractor: (student: TeaseStudent) => any
  isEmpty: (value: any) => boolean
  missingMessage: string
}

const checksConfig: StudentCheck[] = [
  {
    label: 'First Name',
    extractor: (s) => s.firstName,
    isEmpty: (v) => !v,
    missingMessage: 'first names',
  },
  {
    label: 'Last Name',
    extractor: (s) => s.lastName,
    isEmpty: (v) => !v,
    missingMessage: 'last names',
  },
  {
    label: 'Gender',
    extractor: (s) => s.gender,
    isEmpty: (v) => !v,
    missingMessage: 'gender info',
  },
  {
    label: 'Nationality',
    extractor: (s) => s.nationality,
    isEmpty: (v) => !v,
    missingMessage: 'nationality info',
  },
  {
    label: 'Study Degree',
    extractor: (s) => s.studyDegree,
    isEmpty: (v) => !v,
    missingMessage: 'study degree info',
  },
  {
    label: 'Study Program',
    extractor: (s) => s.studyProgram,
    isEmpty: (v) => !v,
    missingMessage: 'study program info',
  },
  {
    label: 'Semester',
    extractor: (s) => s.semester,
    isEmpty: (v) => v === 0,
    missingMessage: 'semester info',
  },
  {
    label: 'Language Proficiency',
    extractor: (s) => s.languages.every((l) => l.proficiency),
    isEmpty: (v) => !v,
    missingMessage: 'language proficiency info',
  },
  {
    label: 'Skills',
    extractor: (s) => s.skill,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'skills',
  },
  {
    label: 'Devices',
    extractor: (s) => s.devices,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'devices',
  },
  {
    label: 'Project Preferences',
    extractor: (s) => s.projectPreferences,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'project preferences',
  },
]

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
      ({ label, extractor, isEmpty, missingMessage }) => {
        const allValid = students.every((s) => !isEmpty(extractor(s)))
        const noneValid = students.every((s) => isEmpty(extractor(s)))

        return {
          label,
          isValid: allValid,
          details: allValid
            ? undefined
            : noneValid
              ? `No students have ${missingMessage}. Please check if your previouse course phases (e.g. application) forward information on ${missingMessage} to this phase.`
              : `Some students are missing ${missingMessage}.`,
        }
      },
    )

    setChecks(results)
  }, [students])

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isError) {
    return <ErrorPage onRetry={refetch} />
  }

  if (!checks) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
      </div>
    )
  }

  return (
    <div className='grid gap-4'>
      {checks.map((check, index) => (
        <Card key={index}>
          <CardContent className='flex items-center gap-4 p-4'>
            {check.isValid ? (
              <CheckCircle className='text-green-500' />
            ) : (
              <AlertCircle className='text-red-500' />
            )}
            <div className='flex flex-col'>
              <span className='font-medium'>{check.label}</span>
              {check.details && (
                <span className='mt-1 text-sm text-muted-foreground'>{check.details}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StudentDataCheck
