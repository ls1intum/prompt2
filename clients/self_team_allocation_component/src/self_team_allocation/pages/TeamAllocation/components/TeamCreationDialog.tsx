import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PlusCircle } from 'lucide-react'

interface Props {
  disabled?: boolean
  onCreate: (name: string) => void
}

export const TeamCreationDialog = ({ disabled, onCreate }: Props) => {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false) // Manage dialog open state

  const handleCreate = (newName: string) => {
    onCreate(newName)
    setName('') // Clear input field after creation
    setOpen(false) // Close the dialog
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full max-w-lg mx-auto' disabled={disabled}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Create new team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            handleCreate(name.trim()) // Call the handleCreate function to submit
          }}
        >
          <DialogHeader>
            <DialogTitle>Create new team</DialogTitle>
            <DialogDescription>The new team will automatically include you.</DialogDescription>
          </DialogHeader>

          <Input
            id='teamName'
            placeholder='Enter team name'
            className='my-4'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
          />

          <DialogFooter>
            <Button type='submit' disabled={!name.trim() || disabled}>
              Create team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
