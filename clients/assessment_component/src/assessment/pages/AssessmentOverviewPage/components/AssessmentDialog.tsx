import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Table } from '@tanstack/react-table'
import { AlertCircle } from 'lucide-react'

import { useGetAllCategoriesWithCompetencies } from '../../hooks/useGetAllCategoriesWithCompetencies'

interface AssessmentDialogProps {
  isOpen: boolean
  onClose: () => void
  courseParticipationID: string
}

export const AssessmentDialog: React.FC<AssessmentDialogProps> = ({
  isOpen,
  onClose,
  courseParticipationID,
}: AssessmentDialogProps) => {
  const { data: categories, isLoading, isError } = useGetAllCategoriesWithCompetencies()

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='p-6'>
            <Skeleton className='h-6 w-1/3 mb-2' />
            <Skeleton className='h-4 w-2/3' />
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className='p-6 flex items-center gap-3 text-destructive'>
        <AlertCircle className='h-5 w-5' />
        <p>Failed to load categories. Please try again later.</p>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className='p-6 text-center text-muted-foreground'>
        <p>No categories found. Create your first category to get started.</p>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assess Students</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
