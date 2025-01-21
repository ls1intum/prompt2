import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'react-router-dom'
import translations from '@/lib/translations.json'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Student } from '@/interfaces/student'
import { searchStudents } from '../../../../../../network/queries/searchStudents'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { Badge } from '@/components/ui/badge'

interface StudentSearchProps {
  onSelect: (selectedStudent: Student | null) => void
  existingApplications: ApplicationParticipation[]
}

export const StudentSearch = ({
  onSelect,
  existingApplications,
}: StudentSearchProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [enteredSearchString, setEnteredSearchString] = useState('')

  const {
    data: users,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['university_users', enteredSearchString, phaseId],
    queryFn: () => searchStudents(enteredSearchString),
    enabled: searchQuery.length > 2,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length > 2) {
      setEnteredSearchString(searchQuery)
      refetch()
    }
  }

  const onClose = () => {
    setSearchQuery('')
    setEnteredSearchString('')
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Search Students Already Registered in Prompt</h2>
      <form onSubmit={handleSearch} className='flex gap-2'>
        <Input
          type='text'
          placeholder={`Enter a name, email, matriculation number, or ${translations.university['login-name']}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type='submit' disabled={searchQuery.length <= 2}>
          <Search className='mr-2 h-4 w-4' />
          Search
        </Button>
      </form>
      {enteredSearchString.length > 0 && isPending ? (
        <div className='flex justify-center items-center h-32'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : enteredSearchString.length > 0 && isError ? (
        <Alert variant='destructive'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to search university users. {error?.message}</AlertDescription>
        </Alert>
      ) : enteredSearchString.length > 0 && users && users.length > 0 ? (
        <ScrollArea className='max-h-[calc(40vh)-150px]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>{translations.university['login-name']}</TableHead>
                <TableHead>Matriculation Number</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.university_login}</TableCell>
                  <TableCell>{user.matriculation_number}</TableCell>
                  <TableCell>
                    {existingApplications.some(
                      (application) => application.student.id === user.id,
                    ) ? (
                      <Badge variant='secondary'>Already Applied</Badge>
                    ) : (
                      <Button
                        size='sm'
                        onClick={() => {
                          onClose()
                          onSelect(user)
                        }}
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : enteredSearchString.length > 0 ? (
        <Alert>
          <AlertTitle>No user found.</AlertTitle>
          <AlertDescription>
            There is no user registered with prompt matching the search string.
          </AlertDescription>
        </Alert>
      ) : null}
      <Separator />
      <div className='space-y-2'>
        <p className='text-sm text-muted-foreground'>
          If you couldn&apos;t find the student, you can add a new one:
        </p>
        <Button
          variant='outline'
          className='w-full'
          onClick={() => {
            onClose()
            onSelect(null)
          }}
        >
          <UserPlus className='mr-2 h-5 w-5' />
          Continue and add a new student
        </Button>
      </div>
    </div>
  )
}
