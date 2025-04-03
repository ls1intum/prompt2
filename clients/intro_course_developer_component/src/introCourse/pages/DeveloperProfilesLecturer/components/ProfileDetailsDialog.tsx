import type React from 'react'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { DeveloperProfile } from '../../../interfaces/DeveloperProfile'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Laptop, Smartphone, Tablet, Watch } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { updateDeveloperProfile } from '../../../network/mutations/updateDeveloperProfile'
import type { PostDeveloperProfile } from '../../../interfaces/PostDeveloperProfile'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import {
  instructorDevProfile,
  type InstructorDeveloperFormValues,
} from '../../../validations/instructorDevProfile'

interface ProfileDetailsDialogProps {
  participant: CoursePhaseParticipationWithStudent
  profile: DeveloperProfile | undefined
  phaseId: string
  onClose: () => void
  onSaved: () => void
}

export const ProfileDetailsDialog: React.FC<ProfileDetailsDialogProps> = ({
  participant,
  profile,
  phaseId,
  onClose,
  onSaved,
}) => {
  // Initialize form with React Hook Form
  const form = useForm<InstructorDeveloperFormValues>({
    resolver: zodResolver(instructorDevProfile),
    defaultValues: {
      appleID: profile?.appleID || '',
      gitLabUsername: profile?.gitLabUsername || '',
      hasMacBook: profile?.hasMacBook || false,
      iPhoneUDID: profile?.iPhoneUDID || '',
      iPadUDID: profile?.iPadUDID || '',
      appleWatchUDID: profile?.appleWatchUDID || '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (devProfile: PostDeveloperProfile) =>
      updateDeveloperProfile(phaseId, participant.courseParticipationID, devProfile),
    onSuccess: () => {
      onSaved()
      onClose()
    },
    onError: (error: unknown) => {
      console.error('Error saving profile:', error)
      let message = 'An error occurred while saving the profile.'
      if (error instanceof Error) {
        message = error.message
      }
      form.setError('root', {
        type: 'manual',
        message,
      })
    },
  })

  const onSubmit = (data: InstructorDeveloperFormValues) => {
    mutate(data)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {profile ? 'Edit Developer Profile' : 'Create Developer Profile'}
          </DialogTitle>
          <DialogDescription>
            {participant.student.firstName} {participant.student.lastName} (
            {participant.student.email})
          </DialogDescription>
        </DialogHeader>

        {form.formState.errors.root && (
          <div className='mb-4 rounded bg-red-100 p-2 text-red-700'>
            {form.formState.errors.root.message}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='appleID'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apple ID</FormLabel>
                    <FormControl>
                      <Input placeholder='example@icloud.com' disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gitLabUsername'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitLab Username</FormLabel>
                    <FormControl>
                      <Input placeholder='username' disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Devices</h3>

              <FormField
                control={form.control}
                name='hasMacBook'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel className='flex items-center gap-2'>
                        <Laptop className='h-5 w-5' /> MacBook
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='iPhoneUDID'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Smartphone className='h-5 w-5' /> iPhone UDID
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='iPhone UDID (optional)' disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='iPadUDID'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Tablet className='h-5 w-5' /> iPad UDID
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='iPad UDID (optional)' disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='appleWatchUDID'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Watch className='h-5 w-5' /> Apple Watch UDID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Apple Watch UDID (optional)'
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
