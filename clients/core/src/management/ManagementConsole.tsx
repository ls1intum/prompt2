import { useKeycloak } from '@/keycloak/useKeycloak'

export const ManagementRoot = (): JSX.Element => {
  const keycloak = useKeycloak()

  return (
    <div>
      <h1>Management Console</h1>
    </div>
  )
}
