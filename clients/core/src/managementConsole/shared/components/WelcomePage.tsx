import { PromptLogo } from '@core/managementConsole/layout/Sidebar/InsideSidebar/components/PromptLogo'

interface EmptyPageProps {
  message?: string
}

export const EmptyPage = ({
  message = 'Select your page in the sidebar to get started.',
}: EmptyPageProps) => {
  return (
    <div className='flex flex-col justify-center items-center w-full h-full p-4'>
      <PromptLogo />
      <p>{message}</p>
    </div>
  )
}
