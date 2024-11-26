import { useKeycloak } from '@/keycloak/useKeycloak'
import { useAuthStore } from '@/zustand/useAuthStore'
import UnauthorizedPage from './components/UnauthorizedPage'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '../Sidebar/app-sidebar'
import { WelcomePage } from './components/WelcomePage'
import { LoadingPage } from '@/components/LoadingPage'
import React from 'react'

export const ManagementRoot = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const { keycloak, logout } = useKeycloak()
  const { user, permissions } = useAuthStore()
  const isLoading = !(keycloak && user)
  const hasChildren = React.Children.count(children) > 0

  if (isLoading) {
    return <LoadingPage />
  }

  // TODO update with what was passed to this page
  if (permissions.length === 0) {
    return <UnauthorizedPage />
  }

  return (
    <SidebarProvider>
      <AppSidebar onLogout={logout} />
      {hasChildren ? children : <WelcomePage />}
    </SidebarProvider>
  )
}
