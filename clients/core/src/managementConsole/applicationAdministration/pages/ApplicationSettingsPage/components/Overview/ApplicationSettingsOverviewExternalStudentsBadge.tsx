import { Users, UserX } from 'lucide-react'

interface ExternalStudentsStatusProps {
  externalStudentsAllowed: boolean
}

export const ExternalStudentsStatusBadge: React.FC<ExternalStudentsStatusProps> = ({
  externalStudentsAllowed,
}: ExternalStudentsStatusProps) => {
  return (
    <div
      className={`w-full p-3 border rounded-md ${externalStudentsAllowed ? 'border-green-200' : 'border-red-200'}`}
    >
      <div className='flex items-center space-x-2'>
        {externalStudentsAllowed ? (
          <Users className='h-4 w-4 text-green-500' />
        ) : (
          <UserX className='h-4 w-4 text-red-500' />
        )}
        <span className='text-sm text-secondary-foreground'>
          {externalStudentsAllowed ? 'External Students Allowed' : 'External Students Not Allowed'}
        </span>
      </div>
    </div>
  )
}
