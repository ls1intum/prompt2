import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ApplicationForm } from '@/interfaces/application_form'
import { getApplicationForm } from '../../../network/queries/applicationForm'
import { UniversitySelection } from './components/UniversitySelection'
import { ApplicationFormView } from '../../../Application/ApplicationFormView'
import { StudentSearch } from './components/StudentSearch'
import { Student } from '@/interfaces/student'
import { postNewApplicationManual } from '../../../network/mutations/postApplicationManual'
import { PostApplication } from '@/interfaces/post_application'
import { useToast } from '@/hooks/use-toast'
import { CreateApplicationAnswerText } from '@/interfaces/application_answer_text'
import { CreateApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'
import { ApplicationParticipation } from '@/interfaces/application_participations'

interface ApplicationManualAddProps {
  existingApplications: ApplicationParticipation[]
}

export const ApplicationManualAdd = ({ existingApplications }: ApplicationManualAddProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [state, setState] = useState({
    page: 1,
    universityAccount: false,
  })
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const resetStates = useCallback(() => {
    setState({
      page: 1,
      universityAccount: false,
    })
    setSelectedStudent(null)
  }, [])

  const {
    data: fetchedApplicationForm,
    isPending: isFetchingApplicationForm,
    isError: isApplicationFormError,
    error,
    refetch: refetchApplicationForm,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', phaseId],
    queryFn: () => getApplicationForm(phaseId ?? ''),
    enabled: !!phaseId,
  })

  const { mutate: mutateSendApplication, error: mutateError } = useMutation({
    mutationFn: (manualApplication: PostApplication) => {
      return postNewApplicationManual(phaseId ?? 'undefined', manualApplication)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application_participations', 'students', phaseId],
      })
      toast({
        title: 'Application added',
        description: 'The application has been successfully added',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: `The application could not be addded. ${mutateError?.message}`,
        variant: 'destructive',
      })
    },
  })

  const submitManualApplication = (
    student: Student,
    answersText: CreateApplicationAnswerText[],
    answersMultiSelect: CreateApplicationAnswerMultiSelect[],
  ) => {
    const manualApplication: PostApplication = {
      student: student,
      answers_text: answersText,
      answers_multi_select: answersMultiSelect,
    }
    mutateSendApplication(manualApplication)
    resetStates()
    setDialogOpen(false)
  }

  const renderContent = () => {
    switch (state.page) {
      case 1:
        return (
          <UniversitySelection
            setHasUniversityAccount={(hasUniversityAccount) => {
              setState((prev) => ({ ...prev, universityAccount: hasUniversityAccount, page: 2 }))
            }}
          />
        )
      case 2:
        return state.universityAccount ? (
          <StudentSearch
            onSelect={(student) => {
              setSelectedStudent(student)
              setState((prev) => ({ ...prev, page: 3 }))
            }}
            existingApplications={existingApplications}
          />
        ) : (
          <ScrollArea className='max-h-[calc(90vh-150px)]'>
            <ApplicationFormView
              questionsText={fetchedApplicationForm?.questions_text ?? []}
              questionsMultiSelect={fetchedApplicationForm?.questions_multi_select ?? []}
              onSubmit={submitManualApplication}
            />
          </ScrollArea>
        )
      case 3:
        return (
          <ScrollArea className='max-h-[calc(90vh-150px)]'>
            <ApplicationFormView
              questionsText={fetchedApplicationForm?.questions_text ?? []}
              questionsMultiSelect={fetchedApplicationForm?.questions_multi_select ?? []}
              student={
                selectedStudent !== null
                  ? selectedStudent
                  : {
                      first_name: '',
                      last_name: '',
                      email: '',
                      has_university_account: true,
                    }
              }
              allowEditUniversityData={selectedStudent === null}
              onSubmit={submitManualApplication}
            />
          </ScrollArea>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetStates()
        }
        setDialogOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[900px] w-[90vw] max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
        </DialogHeader>
        {isFetchingApplicationForm ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
          </div>
        ) : isApplicationFormError ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to fetch application form. {error?.message}
              <Button variant='link' onClick={() => refetchApplicationForm()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          renderContent()
        )}
        <DialogFooter className='sm:justify-start'>
          {state.page !== 1 && (
            <Button
              className='mr-auto'
              onClick={() => setState((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ArrowLeft className='mr-2 h-4 w-4' /> Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
