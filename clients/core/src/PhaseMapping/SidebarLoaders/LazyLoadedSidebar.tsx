import React, { Suspense } from 'react'
import { DisabledSidebarMenuItem } from '../../Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { ExternalSidebarComponent } from './ExternalSidebar'

interface LazyLoadedSidebarProps {
  rootPath: string
  title?: string
  importPath: string
  fallbackTitle?: string
}

/**
 * A dictionary of modules to import. This allows Webpack (or your bundler)
 * to statically build chunks without complaining about fully dynamic imports.
 */
const SIDEBAR_IMPORTS: Record<string, () => Promise<any>> = {
  'template_component/sidebar': () => import('template_component/sidebar'),
  'interview_component/sidebar': () => import('interview_component/sidebar'),
  // Add more paths here if you want to load other sidebars dynamically.
}

export const LazyLoadedSidebar: React.FC<LazyLoadedSidebarProps> = ({
  importPath,
  rootPath,
  title,
  fallbackTitle = 'Component Not Available',
}) => {
  // Validate the path and return a fallback immediately if not recognized.
  const importFn = SIDEBAR_IMPORTS[importPath]
  if (!importFn) {
    console.warn(`Unknown path "${importPath}" - no matching module found.`)
    return <DisabledSidebarMenuItem title={fallbackTitle} />
  }

  // Define the lazy component **inside** your component.
  const LazySidebar = React.lazy(() =>
    importFn()
      .then((module): { default: React.FC } => ({
        default: () => {
          // The default export of the loaded module should be your sidebar schema
          const sidebarElement: SidebarMenuItemProps = module.default || {}
          return (
            <ExternalSidebarComponent
              title={title}
              rootPath={rootPath}
              sidebarElement={sidebarElement}
            />
          )
        },
      }))
      .catch((): { default: React.FC } => ({
        default: () => {
          console.warn(`Failed to load sidebar from "${importPath}"`)
          return <DisabledSidebarMenuItem title={fallbackTitle} />
        },
      })),
  )

  // Return actual JSX (wrapped in <Suspense>).
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <LazySidebar />
    </Suspense>
  )
}
