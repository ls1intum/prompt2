import { PropsWithChildren } from 'react'

export const InsideSidebarHeading = ({ children }: PropsWithChildren): JSX.Element => {
  return <h3 className='uppercase text-xs mt-5 mb-1'>{children}</h3>
}
