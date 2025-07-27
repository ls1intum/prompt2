import type React from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tumaet/prompt-ui-components'
import { Button } from '@tumaet/prompt-ui-components'
import { Plus, FileIcon as FileTemplate } from 'lucide-react'
import { AddCourseDialog } from '@managementConsole/courseOverview/AddingCourse/AddCourseDialog'
import { TemplateSelectionDialog } from './TemplateSelectionDialog'

interface CourseCreationChoiceDialogProps {
  children: React.ReactNode
}

export const CourseCreationChoiceDialog = ({
  children,
}: CourseCreationChoiceDialogProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showTemplateSelection, setShowTemplateSelection] = useState(false)

  const handleNewCourse = () => {
    setIsOpen(false)
    setShowAddCourse(true)
  }

  const handleFromTemplate = () => {
    setIsOpen(false)
    setShowTemplateSelection(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[420px]'>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-xl font-semibold'>Add a New Course</DialogTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Choose how you would like to get started
            </p>
          </DialogHeader>

          <div className='space-y-3 py-4'>
            <Button
              onClick={handleNewCourse}
              className='w-full h-auto p-4 justify-start text-left hover:bg-accent/50 bg-transparent'
              variant='outline'
            >
              <div className='flex items-center gap-3 w-full'>
                <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0'>
                  <Plus className='w-5 h-5 text-primary' />
                </div>
                <div className='flex flex-col min-w-0 flex-1'>
                  <span className='font-medium text-sm'>Create New Course</span>
                  <span className='text-xs text-muted-foreground'>
                    Start from scratch with a blank course
                  </span>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleFromTemplate}
              className='w-full h-auto p-4 justify-start text-left hover:bg-accent/50 bg-transparent'
              variant='outline'
            >
              <div className='flex items-center gap-3 w-full'>
                <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0'>
                  <FileTemplate className='w-5 h-5 text-primary' />
                </div>
                <div className='flex flex-col min-w-0 flex-1'>
                  <span className='font-medium text-sm'>Use Template</span>
                  <span className='text-xs text-muted-foreground'>
                    Choose from your existing course templates
                  </span>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddCourseDialog open={showAddCourse} onOpenChange={setShowAddCourse}></AddCourseDialog>

      <TemplateSelectionDialog
        open={showTemplateSelection}
        onOpenChange={setShowTemplateSelection}
      />
    </>
  )
}
