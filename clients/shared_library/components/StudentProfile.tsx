import React from 'react'
import { Student } from '@/interfaces/student'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { Mail, Flag, Book, GraduationCap, Calendar, Hash, Users, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getGenderString } from '@/interfaces/gender'
import { getStudyDegreeString } from '@/interfaces/study_degree'
import { getCountryName } from '@/lib/getCountries'
import translations from '@/lib/translations.json'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getGravatarUrl } from '@/lib/getGravatarUrl'
import { getStatusColor } from '@/lib/getStatusColor'

interface StudentProfileProps {
  student: Student
  status: PassStatus
}

export const StudentProfile = ({ student, status }: StudentProfileProps): JSX.Element => {
  return (
    <Card className='relative overflow-hidden'>
      {/* Status indicator */}
      <div className={`h-16 ${getStatusColor(status)}`} />
      <div className='mb-4'>
        <Avatar className='absolute w-24 h-24 border-4 border-background rounded-full transform left-3 -translate-y-1/2'>
          <AvatarImage src={getGravatarUrl(student.email)} alt={student.last_name} />
          <AvatarFallback className='rounded-lg font-bold text-lg'>
            {student.first_name[0]}
            {student.last_name[0]}
          </AvatarFallback>
        </Avatar>
      </div>
      <CardHeader>
        <div className='flex flex-col sm:flex-row items-center'>
          {/* Avatar */}
          <div className='flex-1 text-center sm:text-left'>
            <div className='flex flex-col items-center sm:items-start pt-6'>
              <h1 className='text-2xl font-bold'>
                {student.first_name} {student.last_name}
              </h1>
            </div>
            <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div className='space-y-1'>
                <p className='flex items-center justify-center sm:justify-start'>
                  <Mail className='w-4 h-4 mr-2' />
                  <span className='truncate'>{student.email}</span>
                </p>
                {student.nationality && (
                  <p className='flex items-center justify-center sm:justify-start'>
                    <Flag className='w-4 h-4 mr-2' />
                    {getCountryName(student.nationality)}
                  </p>
                )}
                {student.gender && (
                  <p className='flex items-center justify-center sm:justify-start'>
                    <Users className='w-4 h-4 mr-2' />
                    {getGenderString(student.gender)}
                  </p>
                )}
              </div>
              <div className='space-y-1'>
                {student.university_login && (
                  <p className='flex items-center justify-center sm:justify-start'>
                    <KeyRound className='w-4 h-4 mr-2' />
                    <strong className='mr-1'>{translations.university['login-name']}:</strong>
                    {student.university_login}
                  </p>
                )}
                {student.matriculation_number && (
                  <p className='flex items-center justify-center sm:justify-start'>
                    <Hash className='w-4 h-4 mr-2' />
                    <strong className='mr-1'>Matriculation:</strong>
                    {student.matriculation_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center'>
            <Book className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Program:</strong>
            <span className='text-muted-foreground'>{student.study_program || 'N/A'}</span>
          </div>
          <div className='flex items-center'>
            <GraduationCap className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Degree:</strong>
            <span className='text-muted-foreground'>
              {getStudyDegreeString(student.study_degree) || 'N/A'}
            </span>
          </div>
          <div className='flex items-center'>
            <Calendar className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Semester:</strong>
            <span className='text-muted-foreground'>{student.current_semester || 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
