import { Footer } from './Footer'
import { Header } from './Header'

interface NonAuthenticatedPageWrapper {
  children: React.ReactNode
  withLoginButton?: boolean
}

export const NonAuthenticatedPageWrapper = ({
  children,
  withLoginButton = true,
}: NonAuthenticatedPageWrapper): JSX.Element => {
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <main className='flex-grow w-full px-4 sm:px-6 lg:px-8 py-12'>
        <div className='max-w-[1400px] mx-auto'>
          <Header withLoginButton={withLoginButton} />

          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
