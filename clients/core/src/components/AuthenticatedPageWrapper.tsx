import { useKeycloak } from '@/keycloak/useKeycloak'
import { Footer } from './Footer'
import { Header } from './Header'
import { LoadingPage } from '@/components/LoadingPage'
import { useAuthStore } from '@/zustand/useAuthStore'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface NonAuthenticatedPageWrapper {
  children: React.ReactNode
  withLoginButton?: boolean
}

// This page wrapper is meant for all pages that are only accessible to authenticated users, but which is not the management console.
export const AuthenticatedPageWrapper = ({
  children,
  withLoginButton = true,
}: NonAuthenticatedPageWrapper): JSX.Element => {
  const { keycloak } = useKeycloak()
  const { user } = useAuthStore()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const openLogoutDialog = () => setIsLogoutDialogOpen(true)
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false)

  const handleLogout = async () => {
    if (keycloak) {
      const redirectUri = window.location.origin
      await keycloak.logout({ redirectUri })
    }
  }

  if (!keycloak) {
    return <LoadingPage />
  }
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <main className='flex-grow w-full px-4 sm:px-6 lg:px-8 py-12'>
        <div className='max-w-[1400px] mx-auto'>
          <Header
            withLoginButton={withLoginButton}
            userName={user?.username}
            onLogout={openLogoutDialog}
          />

          {children}
        </div>
      </main>
      <Footer />
      {/** Dialog to confirm logout */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You progress will NOT be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={closeLogoutDialog}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
