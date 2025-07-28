import type React from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tumaet/prompt-ui-components'
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
        <DialogContent className='sm:max-w-[420px] p-6'>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-gray-50'>
              Add a New Course
            </DialogTitle>
            <p className='text-sm text-muted-foreground mt-2'>
              Choose how you would like to get started
            </p>
          </DialogHeader>
          <div className='space-y-4 py-6'>
            <div
              onClick={handleNewCourse}
              className={
                'group flex items-center gap-4 w-full p-5 rounded-xl border border-gray-200 bg-white shadow-sm cursor-pointer ' +
                'transition-all duration-200 hover:border-primary hover:bg-primary-foreground/50 hover:shadow-md'
              }
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNewCourse()
                }
              }}
            >
              <div
                className={
                  'flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 ' +
                  'transition-all duration-200 group-hover:bg-primary group-hover:text-white'
                }
              >
                <Plus className='w-6 h-6 text-primary transition-all duration-200 group-hover:text-white' />
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='font-semibold text-base text-gray-800 dark:text-gray-100 transition-colors duration-200 group-hover:text-primary'>
                  Create New Course
                </span>
                <span className='text-sm text-muted-foreground mt-0.5'>
                  Start from scratch with a blank course
                </span>
              </div>
            </div>

            <div
              onClick={handleFromTemplate}
              className={
                'group flex items-center gap-4 w-full p-5 rounded-xl border border-gray-200 bg-white shadow-sm cursor-pointer ' +
                'transition-all duration-200 hover:border-primary hover:bg-primary-foreground/50 hover:shadow-md'
              }
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFromTemplate()
                }
              }}
            >
              <div
                className={
                  'flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 ' +
                  'transition-all duration-200 group-hover:bg-primary group-hover:text-white'
                }
              >
                <FileTemplate className='w-6 h-6 text-primary transition-all duration-200 group-hover:text-white' />
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <span className='font-semibold text-base text-gray-800 dark:text-gray-100 transition-colors duration-200 group-hover:text-primary'>
                  Use Template
                </span>
                <span className='text-sm text-muted-foreground mt-0.5'>
                  Choose from your existing course templates
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AddCourseDialog open={showAddCourse} onOpenChange={setShowAddCourse} />
      <TemplateSelectionDialog
        open={showTemplateSelection}
        onOpenChange={setShowTemplateSelection}
      />
    </>
  )
}
