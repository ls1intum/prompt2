import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { TeaseStudent } from 'src/team_allocation/interfaces/tease/student'
import { Skeleton } from '@/components/ui/skeleton'

type ValidationResult = {
  label: string
  isValid: boolean
  details?: string
}

interface Props {
  students: TeaseStudent[]
}

export default function StudentDataCheck({ students }: Props) {
  const [checks, setChecks] = useState<ValidationResult[] | null>(null)

  useEffect(() => {
    if (!students || students.length === 0) return

    const results: ValidationResult[] = []

    const allHaveLanguageProficiency = students.every((student) =>
      student.languages.every((lang) => !!lang.proficiency),
    )
    const noneHaveLanguageProficiency = students.every((student) => student.languages.length === 0)

    results.push({
      label: 'Language Proficiency Present',
      isValid: allHaveLanguageProficiency,
      details: allHaveLanguageProficiency
        ? undefined
        : noneHaveLanguageProficiency
          ? 'No students have language proficiency info. Please check if your application contains language proficiencies.'
          : 'Some students are missing language proficiency info.',
    })

    const allHaveProjectPreferences = students.every(
      (student) => student.projectPreferences.length > 0,
    )
    const noneHaveProjectPreferences = students.every(
      (student) => student.projectPreferences.length === 0,
    )

    results.push({
      label: 'Project Preferences Provided',
      isValid: allHaveProjectPreferences,
      details: allHaveProjectPreferences
        ? undefined
        : noneHaveProjectPreferences
          ? 'No students have project preferences. Please check if your application contains project preferences.'
          : 'Some students are missing project preferences.',
    })

    const allHaveSkills = students.every((student) => student.skill.length > 0)
    const noneHaveSkills = students.every((student) => student.skill.length === 0)

    results.push({
      label: 'Skills Provided',
      isValid: allHaveSkills,
      details: allHaveSkills
        ? undefined
        : noneHaveSkills
          ? 'No students have skills. Please check if your application contains skills.'
          : 'Some students are missing skills.',
    })

    setChecks(results)
  }, [students])

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
                <Badge variant='outline' className='mt-1 text-sm text-muted-foreground'>
                  {check.details}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
