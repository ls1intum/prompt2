import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from '@tumaet/prompt-ui-components'
import { SearchIcon } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllTutors } from '../../../network/queries/getAllTutors'
import { Tutor } from '../../../interfaces/Tutor'
import translations from '@/lib/translations.json'
import { UpdateTutor } from '../../../interfaces/UpdateTutor'
import { updateTutorGitLabUsername } from '../../../network/mutations/updateTutor'

export function TutorTable() {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  // Store gitlab usernames for each tutor by their id.
  const [gitlabUsernames, setGitlabUsernames] = useState<{ [id: string]: string }>({})
  // Store error messages for update failures by tutor id.
  const [updateErrors, setUpdateErrors] = useState<{ [id: string]: string }>({})
  const queryClient = useQueryClient()

  const {
    data: tutors,
    isLoading,
    isError: isTutorsLoadingError,
  } = useQuery<Tutor[]>({
    queryKey: ['tutors', phaseId],
    queryFn: () => getAllTutors(phaseId ?? ''),
  })

  const { mutate: mutateUpdateTutors } = useMutation({
    mutationFn: ({ tutorID, updateTutorDTO }: { tutorID: string; updateTutorDTO: UpdateTutor }) =>
      updateTutorGitLabUsername(phaseId ?? '', tutorID, updateTutorDTO),
    onSuccess: (data, variables) => {
      // Clear error for the tutor that was updated
      setUpdateErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[variables.tutorID]
        return newErrors
      })
      queryClient.invalidateQueries({ queryKey: ['tutors', phaseId] })
    },
    onError: (error: unknown, variables) => {
      console.error('Error updating tutor:', error)
      setUpdateErrors((prev) => ({
        ...prev,
        [variables.tutorID]: 'Failed to save GitLab username',
      }))
    },
  })

  if (isTutorsLoadingError) {
    return <div>Failed to load tutors</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-grow max-w-md w-full'>
          <Input
            type='search'
            placeholder='Search tutors...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mat Nr</TableHead>
              <TableHead>{translations.university['login-name']}</TableHead>
              <TableHead>GitLab Username</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className='h-5 w-full animate-pulse rounded bg-muted' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tutors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  No tutors found.
                </TableCell>
              </TableRow>
            ) : (
              tutors?.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className='font-medium'>{tutor.firstName}</TableCell>
                  <TableCell className='font-medium'>{tutor.lastName}</TableCell>
                  <TableCell>{tutor.email}</TableCell>
                  <TableCell>{tutor.matriculationNumber}</TableCell>
                  <TableCell>{tutor.universityLogin}</TableCell>
                  <TableCell>
                    <div>
                      <Input
                        placeholder='GitLab Username'
                        value={gitlabUsernames[tutor.id] ?? tutor.gitlabUsername ?? ''}
                        onChange={(e) =>
                          setGitlabUsernames((prev) => ({
                            ...prev,
                            [tutor.id]: e.target.value,
                          }))
                        }
                        onBlur={(e) => {
                          const newGitlabUsername = e.target.value
                          // Only update if the value has changed
                          if (newGitlabUsername !== tutor.gitlabUsername) {
                            mutateUpdateTutors({
                              tutorID: tutor.id,
                              updateTutorDTO: { gitlabUsername: newGitlabUsername },
                            })
                          }
                        }}
                      />
                      {updateErrors[tutor.id] && (
                        <p className='text-red-500 text-xs mt-1'>{updateErrors[tutor.id]}</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
