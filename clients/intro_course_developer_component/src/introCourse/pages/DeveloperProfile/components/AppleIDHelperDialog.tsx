import * as React from 'react'
import { ExternalLink, HelpCircle } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Separator,
} from '@tumaet/prompt-ui-components'

export const AppleIDHelperDialog = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <HelpCircle className='h-4 w-4 mr-1' />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[625px]'>
        <DialogHeader>
          <DialogTitle>Creating an Apple ID</DialogTitle>
          <DialogDescription>Follow these steps to create your Apple ID</DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[80vh] pr-4'>
          <style>
            {`
              .appleID ol {
                  list-style: decimal; /* Restore list-style for ordered lists */
                  margin: 0 0 1rem 1.5rem; /* Adjust spacing around lists */
                  padding: 0;
              }

            `}
          </style>
          <div className='appleID'>
            <ol className='space-y-4 pl-5 text-sm'>
              <li>
                Visit the Apple ID creation page:{' '}
                <a
                  href='https://appleid.apple.com/account'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary hover:underline'
                >
                  https://appleid.apple.com/account
                  <ExternalLink className='ml-1 inline-block h-4 w-4' />
                </a>
              </li>
              <li>Click on &quot;Create Your Apple ID&quot;</li>
              <li>
                Fill in your personal information, including name, birthday, and email address
              </li>
              <li>Choose a strong password that meets Apple&apos;s requirements</li>
              <li>Set up security questions or use two-factor authentication for added security</li>
              <li>
                Verify your email address by clicking the link in the verification email from Apple
              </li>
              <li>Once verified, your Apple ID is ready to use</li>
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
