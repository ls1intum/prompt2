import { RouteObject } from 'react-router-dom'
import { Role } from '@tumaet/prompt-shared-state'

export type ExtendedRouteObject = RouteObject & {
  requiredPermissions?: Role[]
}
