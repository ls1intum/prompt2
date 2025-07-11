import { useState, useEffect, useCallback } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorPage,
  Button,
} from '@tumaet/prompt-ui-components'
import { Plus, Loader2, AlertCircle, MessageCircle } from 'lucide-react'

import type {
  FeedbackItem,
  FeedbackType,
  UpdateFeedbackItemRequest,
} from '../../../../../interfaces/feedbackItem'

import { useGetMyFeedbackItems } from '../hooks/useGetMyFeedbackItems'
import { useCreateFeedbackItem } from '../hooks/useCreateFeedbackItem'
import { useUpdateFeedbackItem } from '../hooks/useUpdateFeedbackItem'
import { useDeleteFeedbackItem } from '../hooks/useDeleteFeedbackItem'
import { DeleteFeedbackItemDialog } from './DeleteFeedbackItemDialog'
import { ItemRow } from '../../../../components/ItemRow'

interface FeedbackItemPanelProps {
  feedbackType: FeedbackType
  courseParticipationID: string
  authorCourseParticipationID: string
  completed?: boolean
}

export function FeedbackItemPanel({
  feedbackType,
  courseParticipationID,
  authorCourseParticipationID,
  completed = false,
}: FeedbackItemPanelProps) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [savingItemId, setSavingItemId] = useState<string | undefined>(undefined)
  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined)

  const {
    feedbackItems: allFeedbackItems,
    isLoading: isGetFeedbackItemsPending,
    isError,
    refetch,
  } = useGetMyFeedbackItems()

  // Filter feedback items by type and course participation
  const feedbackItems = allFeedbackItems.filter(
    (item) =>
      item.feedbackType === feedbackType && item.courseParticipationID === courseParticipationID,
  )

  const { mutate: createFeedbackItem, isPending: isCreatePending } = useCreateFeedbackItem(setError)
  const { mutate: updateFeedbackItem, isPending: isUpdatePending } = useUpdateFeedbackItem(setError)
  const { mutate: deleteFeedbackItem, isPending: isDeletePending } = useDeleteFeedbackItem(setError)

  // Initialize item values when data loads
  useEffect(() => {
    const newValues: Record<string, string> = {}
    feedbackItems.forEach((item) => {
      if (!(item.id in itemValues)) {
        newValues[item.id] = item.feedbackText
      }
    })
    if (Object.keys(newValues).length > 0) {
      setItemValues((prev) => ({ ...prev, ...newValues }))
    }
  }, [feedbackItems, itemValues])

  const addFeedbackItem = () => {
    if (completed) return

    const handleAddFeedbackItem = async () => {
      try {
        await createFeedbackItem(
          {
            feedbackType,
            courseParticipationID,
            authorCourseParticipationID,
            feedbackText: '',
          },
          {
            onSuccess: () => {
              refetch()
            },
          },
        )
      } catch (err) {
        setError('An error occurred while creating the feedback item.')
      }
    }

    handleAddFeedbackItem()
  }

  const debouncedSave = useCallback(
    (item: FeedbackItem, text: string) => {
      const timeoutId = setTimeout(() => {
        if (completed) return

        if (text.trim() !== item.feedbackText.trim()) {
          setSavingItemId(item.id)

          const updateRequest: UpdateFeedbackItemRequest = {
            id: item.id,
            feedbackText: text.trim(),
            feedbackType: item.feedbackType,
            courseParticipationID: item.courseParticipationID,
            authorCourseParticipationID: item.authorCourseParticipationID,
          }

          updateFeedbackItem(updateRequest, {
            onSuccess: () => {
              setSavingItemId(undefined)
              refetch()
            },
            onError: () => {
              setSavingItemId(undefined)
            },
          })
        }
      }, 200)

      return timeoutId
    },
    [updateFeedbackItem, refetch, completed],
  )

  const handleTextChange = (itemId: string, value: string) => {
    setItemValues((prev) => ({ ...prev, [itemId]: value }))

    const item = feedbackItems.find((it) => it.id === itemId)
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
      deleteFeedbackItem(itemToDelete, {
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

  const isPending =
    isGetFeedbackItemsPending || isCreatePending || isUpdatePending || isDeletePending

  const panelTitle =
    courseParticipationID === authorCourseParticipationID
      ? feedbackType === 'positive'
        ? 'What did you do particularly well?'
        : 'Where can you still improve?'
      : feedbackType === 'positive'
        ? 'What did this student do particularly well?'
        : 'Where can this student still improve?'
  const addButtonText = 'Add Item'
  const placeholderText =
    feedbackType === 'positive'
      ? 'What did this person do particularly well?'
      : 'What could this person improve?'

  if (isError) {
    return <ErrorPage message='Error loading feedback items' onRetry={refetch} />
  }

  if (isGetFeedbackItemsPending) {
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
          <CardTitle className='flex items-center gap-2'>
            <MessageCircle
              className={`h-5 w-5 ${feedbackType === 'positive' ? 'text-green-600' : 'text-red-600'}`}
            />
            {panelTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {feedbackItems.map((item) => (
            <ItemRow
              key={item.id}
              type='feedback'
              item={item}
              value={itemValues[item.id] || item.feedbackText}
              onTextChange={handleTextChange}
              onDelete={openDeleteDialog}
              isSaving={savingItemId === item.id}
              isPending={isPending}
              isDisabled={completed}
              placeholder={placeholderText}
            />
          ))}

          <Button
            variant='outline'
            className='w-full border-dashed flex items-center justify-center p-6 hover:bg-muted/50 transition-colors'
            onClick={addFeedbackItem}
            disabled={isPending || completed}
            title={
              completed ? 'Evaluation completed - cannot add new feedback items' : addButtonText
            }
          >
            {isCreatePending ? (
              <Loader2 className='h-5 w-5 mr-2 animate-spin text-muted-foreground' />
            ) : (
              <Plus className='h-5 w-5 mr-2 text-muted-foreground' />
            )}
            <span className='text-muted-foreground'>{addButtonText}</span>
          </Button>

          {error && (
            <div className='flex items-center gap-2 text-destructive text-xs p-2 mt-2 bg-destructive/10 rounded-md'>
              <AlertCircle className='h-3 w-3' />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteFeedbackItemDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeletePending}
      />
    </>
  )
}
