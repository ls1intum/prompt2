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
import { Button } from '@/components/ui/button'
import { Table } from '@tanstack/react-table'

interface SelectStudentsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectCount: number
  setSelectCount: (count: number) => void
  table: Table<any>
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  studentsPassedChallengeCount: number
}

export const SelectStudentsDialog: React.FC<SelectStudentsDialogProps> = ({
  isOpen,
  onClose,
  selectCount,
  setSelectCount,
  table,
  setRowSelection,
  studentsPassedChallengeCount,
}: SelectStudentsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Students</DialogTitle>
          <DialogDescription>
            Specify how many rows to select (based on their challenge passing position)
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Select first ... students'
          value={selectCount}
          type='number'
          min='0'
          max={studentsPassedChallengeCount}
          onChange={(e) => {
            const value = parseInt(e.target.value)
            setSelectCount(
              isNaN(value) ? 0 : Math.min(Math.max(0, value), studentsPassedChallengeCount),
            )
          }}
        />
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const newSelection: Record<string, boolean> = {}
              table.getFilteredRowModel().rows.forEach((row) => {
                const profile = row.original.profile
                if (profile && profile.passingPosition && profile.passingPosition <= selectCount) {
                  newSelection[row.id] = true
                }
              })
              setRowSelection(newSelection)
              onClose()
            }}
          >
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
