import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

export const TemplateComponentSettingsPage = (): JSX.Element => {
  return (
    <div>
      <ManagementPageHeader>Template Component Settings</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        This is the settings page for the Template Component.
      </p>
    </div>
  )
}

export default TemplateComponentSettingsPage
