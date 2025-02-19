import * as React from 'react'
import { ExternalLink, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export const GitLabHelperDialog = (): JSX.Element => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Info className='h-4 w-4 mr-1' />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[625px]'>
        <DialogHeader>
          <DialogTitle>GitLab Account Setup Instructions</DialogTitle>
          <DialogDescription>Follow these steps to copy your LRZ GitLab username</DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[80vh] pr-4'>
          <style>
            {`
              .gitlab ol {
                  list-style: decimal; /* Restore list-style for ordered lists */
                  margin: 0 0 1rem 1.5rem; /* Adjust spacing around lists */
                  padding: 0;
              }
            `}
          </style>
          <div className='gitlab'>
            <ol className='space-y-4 pl-5 text-sm'>
              <li>
                Visit the LRZ GitLab profile page:{' '}
                <a
                  href='https://gitlab.lrz.de/-/profile/account'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary hover:underline'
                >
                  https://gitlab.lrz.de/-/profile/account
                  <ExternalLink className='ml-1 inline-block h-4 w-4' />
                </a>
              </li>
              <li>
                Log in using your TUM LDAP credentials (typically the same as for campus.tum.de,
                e.g., ab12cde)
              </li>
              <li>Scroll down to the &apos;Change username&apos; section</li>
              <li className='font-semibold'>
                Copy only the &apos;your-username&apos; part, excluding the &apos;https://....&apos;
              </li>
            </ol>
          </div>
        </ScrollArea>
        <Separator className='my-4' />
        <div className='flex justify-end'>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
