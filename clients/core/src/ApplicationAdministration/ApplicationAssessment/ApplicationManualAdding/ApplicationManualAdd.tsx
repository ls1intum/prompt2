import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { set } from 'date-fns'

export const ApplicationManualAdd = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
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
          />
        ) : (
          <ScrollArea className='max-h-[calc(90vh-150px)]'>
            <ApplicationFormView
              questionsText={fetchedApplicationForm?.questions_text ?? []}
              questionsMultiSelect={fetchedApplicationForm?.questions_multi_select ?? []}
              onSubmit={() => console.log('Submit')}
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
