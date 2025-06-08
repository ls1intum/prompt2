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
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { Check, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react'

import type { ActionItem, UpdateActionItemRequest } from '../../../../../interfaces/actionItem'
import type { StudentAssessment } from '../../../../../interfaces/studentAssessment'
import { getAllActionItemsForStudentInPhase } from '../../../../../network/queries/getAllActionItemsForStudentInPhase'

import { useCreateActionItem } from '../hooks/useCreateActionItem'
import { useUpdateActionItem } from '../hooks/useUpdateActionItem'
import { useDeleteActionItem } from '../hooks/useDeleteActionItem'

interface ActionItemPanelProps {
  studentAssessment: StudentAssessment
}

export function ActionItemPanel({ studentAssessment }: ActionItemPanelProps) {
  const { phaseId } = useParams<{
    phaseId: string
  }>()
  const [error, setError] = useState<string | null>(null)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const {
    data: actionItems = [],
    isPending: isGetActionItemsPending,
    isError,
    refetch,
  } = useQuery<ActionItem[]>({
    queryKey: ['actionItem', phaseId, studentAssessment.courseParticipationID],
    queryFn: () =>
      getAllActionItemsForStudentInPhase(phaseId ?? '', studentAssessment.courseParticipationID),
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
    const handleAddActionItem = async () => {
      try {
        await createActionItem(
          {
            coursePhaseID: phaseId ?? '',
            courseParticipationID: studentAssessment.courseParticipationID,
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
        if (text.trim() !== item.action.trim() && text.trim() !== '') {
          setSavingItemId(item.id)

          const updateRequest: UpdateActionItemRequest = {
            id: item.id,
            coursePhaseID: phaseId ?? '',
            courseParticipationID: studentAssessment.courseParticipationID,
            action: text.trim(),
            author: userName,
          }

          updateActionItem(updateRequest, {
            onSuccess: () => {
              setSavingItemId(null)
              refetch()
            },
            onError: () => {
              setSavingItemId(null)
            },
          })
        }
      }, 500) // 200 ms delay

      return timeoutId
    },
    [phaseId, studentAssessment.courseParticipationID, userName, updateActionItem, refetch],
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
    setItemToDelete(itemId)
    setDeleteDialogOpen(true)
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
          setItemToDelete(null)
        },
      })
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setItemToDelete(null)
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
            <div key={item.id} className='flex items-start gap-2 p-4 border rounded-md group'>
              <Check className='h-5 w-5 mt-0.5 shrink-0' />

              <div className='flex-1 relative'>
                <Textarea
                  className='w-full resize-none min-h-[24px]'
                  value={itemValues[item.id] || item.action}
                  onChange={(e) => {
                    const cleanup = handleTextChange(item.id, e.target.value)
                    return cleanup
                  }}
                  placeholder='Enter action item...'
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '24px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = target.scrollHeight + 'px'
                  }}
                />

                {savingItemId === item.id && (
                  <div className='absolute top-1 right-1 flex items-center gap-1 text-xs text-muted-foreground bg-white px-1 rounded'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    Saving...
                  </div>
                )}
              </div>

              <Button
                variant='ghost'
                size='icon'
                className='opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={() => openDeleteDialog(item.id)}
                disabled={isPending}
                title='Delete action item'
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
          ))}

          <Button
            variant='outline'
            className='w-full border-dashed flex items-center justify-center p-6 hover:bg-muted/50 transition-colors'
            onClick={addActionItem}
            disabled={isPending}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={cancelDelete} disabled={isDeletePending}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={isDeletePending}>
              {isDeletePending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
