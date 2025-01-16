interface ManagementPageHeaderProps {
  children: React.ReactNode
}

export const ManagementPageHeader = ({ children }: ManagementPageHeaderProps): JSX.Element => {
  return <h1 className='text-4xl font-bold mb-6'>{children}</h1>
}
