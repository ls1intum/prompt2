'use client'

import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorPage,
  Button,
} from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { Plus, Loader2, AlertCircle } from 'lucide-react'

import type { ActionItem, UpdateActionItemRequest } from '../../../../../interfaces/actionItem'
import { getAllActionItemsForStudentInPhase } from '../../../../../network/queries/getAllActionItemsForStudentInPhase'

import { useCreateActionItem } from '../hooks/useCreateActionItem'
import { useUpdateActionItem } from '../hooks/useUpdateActionItem'
import { useDeleteActionItem } from '../hooks/useDeleteActionItem'
import { DeleteActionItemDialog } from './DeleteActionItemDialog'
import { ActionItemRow } from './ActionItemRow'

interface ActionItemPanelProps {
  courseParticipationID: string
  completed?: boolean
}

export function ActionItemPanel({
  courseParticipationID,
  completed = false,
}: ActionItemPanelProps) {
  const { phaseId } = useParams<{
    phaseId: string
  }>()
  const [error, setError] = useState<string | undefined>(undefined)
  const [savingItemId, setSavingItemId] = useState<string | undefined>(undefined)
  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined)

  const {
    data: actionItems = [],
    isPending: isGetActionItemsPending,
    isError,
    refetch,
  } = useQuery<ActionItem[]>({
    queryKey: ['actionItems', phaseId, courseParticipationID],
    queryFn: () => getAllActionItemsForStudentInPhase(phaseId ?? '', courseParticipationID),
  })

  const { mutate: createActionItem, isPending: isCreatePending } = useCreateActionItem(setError)
  const { mutate: updateActionItem, isPending: isUpdatePending } = useUpdateActionItem(setError)
  const { mutate: deleteActionItem, isPending: isDeletePending } = useDeleteActionItem(setError)

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  // Initialize item values when data loads
  useEffect(() => {
    const newValues: Record<string, string> = {}
    actionItems.forEach((item) => {
      if (!(item.id in itemValues)) {
        newValues[item.id] = item.action
      }
    })
    if (Object.keys(newValues).length > 0) {
      setItemValues((prev) => ({ ...prev, ...newValues }))
    }
  }, [actionItems, itemValues])

  const addActionItem = () => {
    if (completed) return

    const handleAddActionItem = async () => {
      try {
        await createActionItem(
          {
            coursePhaseID: phaseId ?? '',
            courseParticipationID: courseParticipationID,
            action: '',
            author: userName,
          },
          {
            onSuccess: () => {
              refetch()
            },
          },
        )
      } catch (err) {
        setError('An error occurred while creating the action item.')
      }
    }

    handleAddActionItem()
  }

  const debouncedSave = useCallback(
    (item: ActionItem, text: string) => {
      const timeoutId = setTimeout(() => {
        if (completed) return

        if (text.trim() !== item.action.trim()) {
          setSavingItemId(item.id)

          const updateRequest: UpdateActionItemRequest = {
            id: item.id,
            coursePhaseID: phaseId ?? '',
            courseParticipationID: courseParticipationID,
            action: text.trim(),
            author: userName,
          }

          updateActionItem(updateRequest, {
            onSuccess: () => {
              setSavingItemId(undefined)
              refetch()
            },
            onError: () => {
              setSavingItemId(undefined)
            },
          })
        }
      }, 200) // 200 ms delay

      return timeoutId
    },
    [phaseId, courseParticipationID, userName, updateActionItem, refetch, completed],
  )

  const handleTextChange = (itemId: string, value: string) => {
    setItemValues((prev) => ({ ...prev, [itemId]: value }))

    const item = actionItems.find((it) => it.id === itemId)
    if (item) {
      const timeoutId = debouncedSave(item, value)
      return () => clearTimeout(timeoutId)
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
          // Remove from local state
          setItemValues((prev) => {
            const newValues = { ...prev }
            delete newValues[itemToDelete]
            return newValues
          })
          refetch()
          setDeleteDialogOpen(false)
          setItemToDelete(undefined)
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
        </CardHeader>
        <CardContent className='space-y-2'>
          {actionItems.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              value={itemValues[item.id] || item.action}
              onTextChange={handleTextChange}
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
