import { Link } from 'react-router-dom'
import packageJSON from '../../../../../../package.json'

export const PromptLogo = () => {
  const version = packageJSON.version

  return (
    <Link to='/' className='flex items-center hover:opacity-80 transition-opacity duration-150'>
      <img src='/prompt_logo.svg' alt='Prompt logo' className='size-8 -mr-1' />
      <div className='relative flex items-baseline'>
        <span className='text-lg font-extrabold tracking-wide text-primary drop-shadow-sm'>
          PROMPT
        </span>
        <span className='ml-1 text-xs font-normal text-gray-400'>{version}</span>
      </div>
    </Link>
  )
}
