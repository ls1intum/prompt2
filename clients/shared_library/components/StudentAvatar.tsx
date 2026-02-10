import { Avatar, AvatarFallback, AvatarImage } from '@tumaet/prompt-ui-components'
import { getGravatarUrl } from '@/lib/getGravatarUrl'
import { Link } from 'react-router-dom'
import { ReactNode } from 'react'

interface MinimalStudent {
  id?: string
  firstName: string
  lastName: string
  email: string
}

interface StudentAvatarProps {
  student: MinimalStudent
}

export const StudentAvatar = ({ student }: StudentAvatarProps) => {
  const avatar = (
    <>
      <Avatar className='h-6 w-6'>
        <AvatarImage
          src={getGravatarUrl(student.email)}
          alt={`${student.firstName} ${student.lastName}`}
        />
        <AvatarFallback className='text-[0.6rem] font-medium'>
          {student.firstName[0]}
          {student.lastName[0]}
        </AvatarFallback>
      </Avatar>
      <span className='text-xs transition-colors'>
        {student.firstName} {student.lastName}
      </span>
    </>
  )

  return student.id ? (
    <Link
      to={`/management/students/${student.id}`}
      className='flex items-center gap-2 hover:text-blue-500'
    >
      {avatar}
    </Link>
  ) : (
    avatar
  )
}
export const RenderStudents = ({
  students,
  fallback,
  className = '',
}: {
  students: MinimalStudent[]
  fallback: ReactNode
  className?: string
}) => {
  return (
    <div className={className}>
      {students.length === 0 ? (
        fallback
      ) : (
        <ul className='flex flex-wrap gap-x-2'>
          {students.map((student) => (
            <li key={student.id ?? student.email}>
              <StudentAvatar student={student} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
