import { PromptLogo } from '@core/managementConsole/layout/Sidebar/InsideSidebar/components/PromptLogo'

export const WelcomePage = () => {
  return (
    <div className='flex flex-col justify-center items-center w-full h-full p-4'>
      <PromptLogo />
      <p>Select your page in the sidebar to get started.</p>
    </div>
  )
}
