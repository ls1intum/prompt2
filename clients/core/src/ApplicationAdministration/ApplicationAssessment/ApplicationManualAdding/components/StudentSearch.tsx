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

// This is a mock function. Replace it with your actual API call.
const searchUniversityUsers = async (query: string, phaseId: string) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    { id: '1', name: 'John Doe', email: 'john@university.edu' },
    { id: '2', name: 'Jane Smith', email: 'jane@university.edu' },
    { id: '3', name: 'Jane Smith', email: 'jane@university.edu' },
    { id: '4', name: 'Jane Smith', email: 'jane@university.edu' },
    { id: '5', name: 'Jane Smith', email: 'jane@university.edu' },
  ]
}

interface StudentSearchProps {
  onSelect: (selectedStudent: Student | null) => void
}

export const StudentSearch = ({ onSelect }: StudentSearchProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const {
    data: users,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['university_users', searchQuery, phaseId],
    queryFn: () => searchUniversityUsers(searchQuery, phaseId ?? ''),
    enabled: searchQuery.length > 2,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length > 2) {
      setHasSearched(true)
      refetch()
    }
  }

  const onClose = () => {
    setSearchQuery('')
    setHasSearched(false)
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
      {hasSearched && isPending ? (
        <div className='flex justify-center items-center h-32'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : hasSearched && isError ? (
        <Alert variant='destructive'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to search university users. {error?.message}</AlertDescription>
        </Alert>
      ) : hasSearched && users && users.length > 0 ? (
        <ScrollArea className='max-h-[calc(40vh)]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button size='sm' onClick={() => console.log('Add user', user.id)}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : hasSearched ? (
        <p>No users found</p>
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
