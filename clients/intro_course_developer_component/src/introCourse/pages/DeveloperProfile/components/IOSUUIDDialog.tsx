import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Smartphone, Laptop, HelpCircle } from 'lucide-react'

export default function IOSUUIDDialog() {
  const [open, setOpen] = useState(false)

  const instructions = [
    {
      title: 'Step 1: Connect your device',
      description:
        'Attach your device to your Mac with a cable, and select "Trust" if prompted. (For watchOS, attach the iPhone paired with your watch.)',
    },
    {
      title: 'Option 1: Using the Finder',
      substeps: [
        {
          title: 'Locate your device',
          description: (
            <div>
              Find your device under the Locations section in the Finder sidebar. If the Locations
              section isn&apos;t visible, refer to the{' '}
              <a
                href='https://support.apple.com/guide/mac-help/customize-finder-toolbar-sidebar-mac-mchlp3011/mac'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary underline'
              >
                Apple Support Page
              </a>
              .
            </div>
          ),
        },
        {
          title: 'View device details',
          description: `Select your device and click the label below the device name in the info pane. 
            This displays details like the serial number, UDID, and model. Additional clicks cycle through other details (e.g. storage, IMEI/MEID).`,
        },
        {
          title: 'Copy device ID',
          description:
            'Control-click the label (UUID) to copy your device ID. The UUID is of the form "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX".',
        },
      ],
    },
    {
      title: 'Option 2: Using Xcode',
      substeps: [
        {
          title: 'Open Devices and Simulators',
          description:
            'In Xcode, go to "Window" > "Devices and Simulators" and select the "Devices" tab.',
        },
        {
          title: 'Select your device',
          description: 'Choose your device from the list of connected devices.',
        },
        {
          title: 'Copy device ID',
          description:
            'Highlight the device ID (labeled as Identifier) to copy it. The UUID is of the form "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX".',
        },
      ],
    },
  ]

  return (
    <div className='flex flex-col items-center justify-center'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <HelpCircle className='h-4 w-4 mr-1' />
            Help
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-2xl flex flex-col max-h-[90vh]'>
          <DialogHeader className='border-b pb-4'>
            <DialogTitle>Getting iOS Device UUID</DialogTitle>
            <DialogDescription>
              Follow these steps to obtain the UUID (Unique Device Identifier) of your iOS device
            </DialogDescription>
          </DialogHeader>

          <div className='overflow-y-auto flex-1 py-4'>
            <div className='space-y-6'>
              {instructions.map((instruction, index) => (
                <div key={index} className='space-y-4'>
                  <div className='flex gap-3'>
                    {index === 0 ? (
                      <Smartphone className='h-5 w-5 text-primary flex-shrink-0 mt-1 mr-1' />
                    ) : (
                      <Laptop className='h-5 w-5 text-primary flex-shrink-0 mt-1 mr-1' />
                    )}
                    <div>
                      <h3 className='text-lg font-semibold'>{instruction.title}</h3>
                      {instruction.description && (
                        <p className='text-sm text-muted-foreground mt-1'>
                          {instruction.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {instruction.substeps && (
                    <div className='ml-11 border-l border-border space-y-4'>
                      {instruction.substeps.map((substep, subIndex) => (
                        <div key={subIndex} className='space-y-1 ml-4'>
                          <div className='flex items-start gap-2'>
                            <h4 className='font-medium'>
                              {subIndex + 1}. {substep.title}
                            </h4>
                          </div>
                          <div className='ml-7 text-sm text-muted-foreground'>
                            {substep.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {index < instructions.length - 1 && <Separator className='my-2' />}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className='mt-auto pt-4 border-t'>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
