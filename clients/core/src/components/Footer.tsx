import { useNavigate } from 'react-router-dom'
import packageJSON from '../../../package.json'

export const Footer = (): JSX.Element => {
  const version = packageJSON.version
  const navigate = useNavigate()

  return (
    <footer className='w-full mt-16 py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200'>
      <div className='max-w-[1400px] mx-auto text-center text-sm text-gray-500'>
        <p className='mb-2'>
          &copy; 2024 TUM, CIT Research Group for Applied Education Technologies.
        </p>
        <nav className='space-x-4'>
          <a
            href={`https://github.com/ls1intum/prompt2`}
            target='_blank'
            className='text-gray-500 hover:text-gray-700 transition-colors underline'
            rel='noreferrer'
          >
            v{version}
          </a>
          <a
            onClick={() => navigate('/about')}
            className='text-gray-500 hover:text-gray-700 transition-colors underline cursor-pointer'
          >
            About
          </a>
          <a
            onClick={() => navigate('/imprint')}
            className='text-gray-500 hover:text-gray-700 transition-colors underline cursor-pointer'
          >
            Imprint
          </a>
          <a
            onClick={() => navigate('/privacy')}
            className='text-gray-500 hover:text-gray-700 transition-colors underline cursor-pointer'
          >
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  )
}