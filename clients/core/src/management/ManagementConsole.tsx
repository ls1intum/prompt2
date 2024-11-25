import { useKeycloak } from '@/keycloak/useKeycloak'
import { useAuthStore } from '@/zustand/useAuthStore'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import UnauthorizedPage from './components/UnauthorizedPage'

export const ManagementRoot = (): JSX.Element => {
  const { keycloak, logout } = useKeycloak()
  const { user, permissions } = useAuthStore()
  const isLoading = !(keycloak && user)

  if (isLoading) {
    return <Loader2 className='h-8 w-8 animate-spin text-primary bg-center' />
  }

  // TODO update with what was passed to this page
  if (permissions.length === 0) {
    return <UnauthorizedPage />
  }

  return (
    <div>
      <h1>Management Console</h1>
      <p>Welcome, {user?.firstName}!</p>
      {permissions.map((permission) => (
        <p key={permission}>{permission}</p>
      ))}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
