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
  return (
    <Link to={`/management/students/${student.id}`} className='flex items-center gap-2'>
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
      <span className='text-xs transition-colors hover:text-blue-500'>
        {student.firstName} {student.lastName}
      </span>
    </Link>
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
          {students.map((member) => (
            <li key={member.id}>
              <StudentAvatar student={member} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
