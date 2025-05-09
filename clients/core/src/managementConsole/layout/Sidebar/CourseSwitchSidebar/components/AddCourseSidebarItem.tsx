import { SidebarMenuButton, SidebarMenuItem } from '@tumaet/prompt-ui-components'
import { Plus } from 'lucide-react'
import { AddCourseDialog } from '../../../../courseOverview/AddingCourse/AddCourseDialog'

export const AddCourseButton = (): JSX.Element => {
  return (
    <SidebarMenuItem>
      <AddCourseDialog>
        <SidebarMenuButton
          size='lg'
          tooltip={{
            children: 'Add a new course',
            hidden: false,
          }}
          className='min-w-12 min-h-12 p-0'
        >
          <div className='relative flex aspect-square size-12 items-center justify-center'>
            <div className='flex aspect-square size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-800'>
              <Plus className='size-6' />
            </div>
          </div>
        </SidebarMenuButton>
      </AddCourseDialog>
    </SidebarMenuItem>
  )
}
