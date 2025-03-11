import type React from 'react'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { DeveloperProfile } from 'src/introCourse/interfaces/DeveloperProfile'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Laptop, Smartphone, Tablet, Watch } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { updateDeveloperProfile } from '../../../network/mutations/updateDeveloperProfile'
import { PostDeveloperProfile } from 'src/introCourse/interfaces/PostDeveloperProfile'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface ProfileDetailsDialogProps {
  participant: CoursePhaseParticipationWithStudent
  profile: DeveloperProfile | null
  phaseId: string
  onClose: () => void
  onSaved: () => void
}

export const ProfileDetailsDialog = ({
  participant,
  profile,
  phaseId,
  onClose,
  onSaved,
}: ProfileDetailsDialogProps) => {
  // Initialize form state with existing profile or default values
  const [formData, setFormData] = useState<DeveloperProfile>({
    coursePhaseID: phaseId,
    courseParticipationID: participant.courseParticipationID,
    appleID: profile?.appleID || '',
    gitLabUsername: profile?.gitLabUsername || '',
    hasMacBook: profile?.hasMacBook || false,
    iPhoneUUID: profile?.iPhoneUUID || '',
    iPadUUID: profile?.iPadUUID || '',
    appleWatchUUID: profile?.appleWatchUUID || '',
  })

  const saveMutation = useMutation({
    mutationFn: (devProfile: PostDeveloperProfile) => {
      return updateDeveloperProfile(phaseId ?? '', participant.courseParticipationID, devProfile)
    },
    onSuccess: () => {
      // TODO
      onSaved()
      onClose()
    },
    onError: (error) => {
      // TODO
      console.error('Error saving profile:', error)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const devProfile: PostDeveloperProfile = {
      appleID: formData.appleID,
      gitLabUsername: formData.gitLabUsername,
      hasMacBook: formData.hasMacBook,
      iPhoneUUID: formData.iPhoneUUID === '' ? undefined : formData.iPhoneUUID,
      iPadUUID: formData.iPadUUID === '' ? undefined : formData.iPadUUID,
      appleWatchUUID: formData.appleWatchUUID === '' ? undefined : formData.appleWatchUUID,
    }

    saveMutation.mutate(devProfile)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
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

        <form onSubmit={handleSubmit} className='space-y-6 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='appleID'>Apple ID</Label>
              <Input
                id='appleID'
                name='appleID'
                value={formData.appleID}
                onChange={handleChange}
                placeholder='example@icloud.com'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='gitLabUsername'>GitLab Username</Label>
              <Input
                id='gitLabUsername'
                name='gitLabUsername'
                value={formData.gitLabUsername}
                onChange={handleChange}
                placeholder='username'
              />
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Devices</h3>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='hasMacBook'
                name='hasMacBook'
                checked={formData.hasMacBook}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hasMacBook: checked === true }))
                }
              />
              <Label htmlFor='hasMacBook' className='flex items-center gap-2'>
                <Laptop className='h-5 w-5' /> MacBook
              </Label>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Smartphone className='h-5 w-5' />
                <Label htmlFor='iPhoneUUID'>iPhone UUID</Label>
              </div>
              <Input
                id='iPhoneUUID'
                name='iPhoneUUID'
                value={formData.iPhoneUUID || ''}
                onChange={handleChange}
                placeholder='iPhone UUID (optional)'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Tablet className='h-5 w-5' />
                <Label htmlFor='iPadUUID'>iPad UUID</Label>
              </div>
              <Input
                id='iPadUUID'
                name='iPadUUID'
                value={formData.iPadUUID || ''}
                onChange={handleChange}
                placeholder='iPad UUID (optional)'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Watch className='h-5 w-5' />
                <Label htmlFor='appleWatchUUID'>Apple Watch UUID</Label>
              </div>
              <Input
                id='appleWatchUUID'
                name='appleWatchUUID'
                value={formData.appleWatchUUID || ''}
                onChange={handleChange}
                placeholder='Apple Watch UUID (optional)'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
