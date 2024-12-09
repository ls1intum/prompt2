import { RouteObject } from 'react-router-dom'
import { Role } from './permission_roles'

export type ExtendedRouteObject = RouteObject & {
  requiredPermissions?: Role[]
}
