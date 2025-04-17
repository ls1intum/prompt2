import { useEffect, useState } from 'react'
import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { TeaseStudent } from 'src/team_allocation/interfaces/tease/student'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPage } from '@/components/ErrorPage'
import { Loader2 } from 'lucide-react'

type ValidationResult = {
  label: string
  isValid: boolean
  details?: string
}

export const StudentDataCheck = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: fetchedStudents,
    isPending: isStudentsPending,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useQuery<TeaseStudent[]>({
    queryKey: ['tease_students', phaseId],
    queryFn: () => getAllTeaseStudents(phaseId ?? ''),
  })

  const [checks, setChecks] = useState<ValidationResult[] | null>(null)

  useEffect(() => {
    if (!fetchedStudents || fetchedStudents.length === 0) return

    const results: ValidationResult[] = []

    const allHaveLanguageProficiency = fetchedStudents.every((student) =>
      student.languages.every((lang) => !!lang.proficiency),
    )
    const noneHaveLanguageProficiency = fetchedStudents.every(
      (student) => student.languages.length === 0,
    )

    results.push({
      label: 'Language Proficiency',
      isValid: allHaveLanguageProficiency,
      details: allHaveLanguageProficiency
        ? undefined
        : noneHaveLanguageProficiency
          ? 'No students have language proficiency info. Please check if your application contains language proficiencies.'
          : 'Some students are missing language proficiency info.',
    })

    const allHaveProjectPreferences = fetchedStudents.every(
      (student) => student.projectPreferences.length > 0,
    )
    const noneHaveProjectPreferences = fetchedStudents.every(
      (student) => student.projectPreferences.length === 0,
    )

    results.push({
      label: 'Project Preferences',
      isValid: allHaveProjectPreferences,
      details: allHaveProjectPreferences
        ? undefined
        : noneHaveProjectPreferences
          ? 'No students have project preferences. Please check if your application contains project preferences.'
          : 'Some students are missing project preferences.',
    })

    const allHaveSkills = fetchedStudents.every((student) => student.skill.length > 0)
    const noneHaveSkills = fetchedStudents.every((student) => student.skill.length === 0)

    results.push({
      label: 'Skills',
      isValid: allHaveSkills,
      details: allHaveSkills
        ? undefined
        : noneHaveSkills
          ? 'No students have skills. Please check if your application contains skills.'
          : 'Some students are missing skills.',
    })

    const allHaveDevices = fetchedStudents.every((student) => student.devices.length > 0)
    const noneHaveDevices = fetchedStudents.every((student) => student.devices.length === 0)
    results.push({
      label: 'Devices',
      isValid: allHaveDevices,
      details: allHaveDevices
        ? undefined
        : noneHaveDevices
          ? 'No students have devices. Please check if your application contains devices.'
          : 'Some students are missing devices.',
    })

    setChecks(results)
  }, [fetchedStudents])

  if (!checks) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
      </div>
    )
  }

  if (isStudentsPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }
  if (isStudentsError) {
    return <ErrorPage onRetry={refetchStudents} />
  } else {
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
}

export default StudentDataCheck
