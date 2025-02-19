import * as React from 'react'
import { Info, Laptop, Smartphone } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InstructionStep, RenderInstructionSteps } from './RenderInstructionSteps'

type DeviceType = 'ios' | 'mac'

const instructions: Record<DeviceType, InstructionStep[]> = {
  ios: [
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
          description:
            'Select your device and click the label below the device name in the info pane. This displays details like the serial number, UDID, and model. Additional clicks cycle through other details (e.g. storage, IMEI/MEID).',
        },
        {
          title: 'Copy device ID',
          description: 'Control-click the label (UDID) to copy your device ID.',
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
          description: 'Highlight the device ID (labeled as Identifier) to copy it.',
        },
      ],
    },
  ],
  mac: [
    {
      title: 'Collect device identifiers on macOS',
      description:
        'Go to Apple menu > About This Mac. Click "System Report", then select "Hardware" to view the Hardware Overview. The device ID appears as the Hardware UUID (macOS 10.15 and earlier) or Provisioning UDID (macOS 11.0 and later). Highlight the identifier to copy it.',
    },
  ],
}

interface UUIDHelperDialogProps {
  deviceType: DeviceType
}

export const UUIDHelperDialog = ({ deviceType }: UUIDHelperDialogProps): JSX.Element => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Info className='h-4 w-4 mr-1' />
          Help
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>Getting your Device UUID</DialogTitle>
          <DialogDescription>
            Follow these steps to find your device UUID. Select your device type below.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={deviceType} className='mt-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='ios'>
              <Smartphone className='w-4 h-4 mr-2' />
              iOS
            </TabsTrigger>
            <TabsTrigger value='mac'>
              <Laptop className='w-4 h-4 mr-2' />
              macOS
            </TabsTrigger>
          </TabsList>
          <TabsContent value='ios' className='mt-4'>
            <ScrollArea className='max-h-[60vh] pr-4 rounded-md border p-4'>
              <RenderInstructionSteps steps={instructions.ios} />
            </ScrollArea>
          </TabsContent>
          <TabsContent value='mac' className='mt-4'>
            <ScrollArea className='max-h-[60vh] pr-4 rounded-md border p-4'>
              <RenderInstructionSteps steps={instructions.mac} />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className='my-4' />

        <div className='flex justify-end'>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
