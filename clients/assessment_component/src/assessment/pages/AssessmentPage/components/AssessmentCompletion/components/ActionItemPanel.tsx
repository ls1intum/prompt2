import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Loader2, AlertCircle } from 'lucide-react'

import { useAuthStore } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorPage,
  Button,
} from '@tumaet/prompt-ui-components'

import type { ActionItem, UpdateActionItemRequest } from '../../../../../interfaces/actionItem'
import { getAllActionItemsForStudentInPhase } from '../../../../../network/queries/getAllActionItemsForStudentInPhase'

import { useStudentAssessmentStore } from '../../../../../zustand/useStudentAssessmentStore'

import { useCreateActionItem } from '../hooks/useCreateActionItem'
import { useUpdateActionItem } from '../hooks/useUpdateActionItem'
import { useDeleteActionItem } from '../hooks/useDeleteActionItem'
import { DeleteActionItemDialog } from './DeleteActionItemDialog'
import { ItemRow } from '../../../../components/ItemRow'

export function ActionItemPanel() {
  const { phaseId, courseParticipationID } = useParams<{
    phaseId: string
    courseParticipationID: string
  }>()
  const [error, setError] = useState<string | undefined>(undefined)
  const [savingItemId, setSavingItemId] = useState<string | undefined>(undefined)
  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined)

  const { assessmentCompletion } = useStudentAssessmentStore()

  const completed = assessmentCompletion?.completed ?? false

  const {
    data: actionItems = [],
    isPending: isGetActionItemsPending,
    isError,
    refetch,
  } = useQuery<ActionItem[]>({
    queryKey: ['actionItems', phaseId, courseParticipationID],
    queryFn: () => getAllActionItemsForStudentInPhase(phaseId ?? '', courseParticipationID ?? ' '),
  })

  const { mutate: createActionItem, isPending: isCreatePending } = useCreateActionItem(setError)
  const { mutate: updateActionItem, isPending: isUpdatePending } = useUpdateActionItem(setError)
  const { mutate: deleteActionItem, isPending: isDeletePending } = useDeleteActionItem(setError)

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  const addActionItem = async () => {
    if (completed) return

    return await createActionItem({
      coursePhaseID: phaseId ?? '',
      courseParticipationID: courseParticipationID ?? '',
      action: '',
      author: userName,
    })
  }

  const handleTextChange = (itemId: string, value: string) => {
    setItemValues((prev) => ({ ...prev, [itemId]: value }))
  }

  const handleTextBlur = (itemId: string) => {
    if (completed) return

    const item = actionItems.find((it) => it.id === itemId)
    const value = itemValues[itemId]

    if (item && value !== undefined && value.trim() !== item.action.trim()) {
      setSavingItemId(item.id)

      const updateRequest: UpdateActionItemRequest = {
        id: item.id,
        coursePhaseID: phaseId ?? '',
        courseParticipationID: courseParticipationID ?? '',
        action: value.trim(),
        author: userName,
      }

      updateActionItem(updateRequest)
    }
  }

  const openDeleteDialog = (itemId: string) => {
    if (!completed) {
      setItemToDelete(itemId)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteActionItem(itemToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
        },
      })
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setItemToDelete(undefined)
  }

  const isPending = isGetActionItemsPending || isCreatePending || isUpdatePending || isDeletePending

  if (isError) {
    return <ErrorPage message='Error loading assessments' onRetry={refetch} />
  }

  if (isGetActionItemsPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            Will be shown to students after the deadline
          </p>
        </CardHeader>
        <CardContent className='space-y-2'>
          {actionItems.map((item) => (
            <ItemRow
              key={item.id}
              type='action'
              item={item}
              value={itemValues[item.id] ?? item.action}
              onTextChange={handleTextChange}
              onTextBlur={handleTextBlur}
              onDelete={openDeleteDialog}
              isSaving={savingItemId === item.id}
              isPending={isPending}
              isDisabled={completed}
            />
          ))}

          <Button
            variant='outline'
            className='w-full border-dashed flex items-center justify-center p-6 hover:bg-muted/50 transition-colors'
            onClick={addActionItem}
            disabled={isPending || completed}
            title={
              completed
                ? 'Assessment completed - cannot add new action items'
                : 'Add new action item'
            }
          >
            {isCreatePending ? (
              <Loader2 className='h-5 w-5 mr-2 animate-spin text-muted-foreground' />
            ) : (
              <Plus className='h-5 w-5 mr-2 text-muted-foreground' />
            )}
            <span className='text-muted-foreground'>Add Action Item</span>
          </Button>

          {error && (
            <div className='flex items-center gap-2 text-destructive text-xs p-2 mt-2 bg-destructive/10 rounded-md'>
              <AlertCircle className='h-3 w-3' />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteActionItemDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeletePending}
      />
    </>
  )
}
