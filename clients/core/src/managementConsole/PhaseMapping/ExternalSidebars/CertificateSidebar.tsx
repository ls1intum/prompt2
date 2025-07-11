import { Role } from '@tumaet/prompt-shared-state'
import { Award } from 'lucide-react'
import { ExternalSidebarComponent } from './ExternalSidebar'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

export const CertificateSidebar = ({
    rootPath,
    title,
    coursePhaseID,
}: {
    rootPath: string
    title: string
    coursePhaseID: string
}) => {
    const certificateSidebarItems: SidebarMenuItemProps = {
        title: 'Certificate',
        icon: <Award />,
        goToPath: '',
        requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
        subitems: [
            {
                title: 'Overview',
                goToPath: '/overview',
                requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER, Role.COURSE_EDITOR],
            },
            {
                title: 'Settings',
                goToPath: '/settings',
                requiredPermissions: [Role.PROMPT_ADMIN, Role.COURSE_LECTURER],
            },
        ],
    }
    return (
        <ExternalSidebarComponent
            title={title}
            rootPath={rootPath}
            sidebarElement={certificateSidebarItems}
        />
    )
}
