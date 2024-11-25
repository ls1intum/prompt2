import { useKeycloak } from '@/keycloak/useKeycloak'
import { useAuthStore } from '@/zustand/useAuthStore'
import { useEffect, useState } from 'react'

export const ManagementRoot = (): JSX.Element => {
  const { keycloak, logout } = useKeycloak()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (keycloak && user) {
      setIsLoading(false)
    }
  }, [keycloak, user])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Management Console</h1>
      <p>Welcome, {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
