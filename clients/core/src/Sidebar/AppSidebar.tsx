'use client'

import * as React from 'react'
import {
  BellElectric,
  BookOpen,
  Bot,
  FileUser,
  Settings2,
  SquareTerminal,
  Users,
} from 'lucide-react'

import { Sidebar } from '@/components/ui/sidebar'
import { InsideCourseSidebar } from './InsideCourseSidebar'
import { CourseSwitchSidebar } from './CourseSwitchSidebar/CourseSwitchSidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'iPraktikum',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Application',
          url: '#',
          icon: FileUser,
          items: [
            {
              title: 'Dashboard',
              url: '#',
            },
            {
              title: 'Applications',
              url: '#',
            },
            {
              title: 'Application Questions',
              url: '#',
            },
          ],
        },
        {
          title: 'Intro Course',
          url: '#',
          icon: BellElectric,
        },
        {
          title: 'Team Phase',
          url: '#',
          icon: Users,
        },
        {
          title: 'Settings',
          url: '#',
          icon: Settings2,
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
          icon: Settings2,
        },
        {
          title: 'Explorer',
          url: '#',
          icon: Settings2,
        },
        {
          title: 'Quantum',
          url: '#',
          icon: Settings2,
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onLogout: () => void
}

export function AppSidebar({ onLogout, ...props }: AppSidebarProps): JSX.Element {
  // TODO this will be replaced with router logic
  const [activeItem] = React.useState(data.navMain[0])

  return (
    <Sidebar
      collapsible='icon'
      className='overflow-hidden [&>[data-sidebar=sidebar]]:flex-row'
      {...props}
    >
      {/* This is the first sidebar */}
      <CourseSwitchSidebar onLogout={onLogout} />
      <InsideCourseSidebar activeItem={activeItem} />
    </Sidebar>
  )
}
