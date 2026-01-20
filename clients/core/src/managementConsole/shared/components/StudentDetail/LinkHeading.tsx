import { PropsWithChildren } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LinkHeadingProps extends PropsWithChildren {
  targetURL: string
}

export const LinkHeading = ({ children, targetURL }: LinkHeadingProps) => {
  return (
    <Link to={targetURL} className='flex items-center hover:text-blue-500'>
      {children}
      <ArrowUpRight className='w-5 h-5' />
    </Link>
  )
}
