import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { YesNoButtons } from '../../components/YesNoButtons'
import { developerFormSchema, type DeveloperFormValues } from '../../validations/developerProfile'
import { GitLabHelperDialog } from './components/GitLabHelperDialog'
import { AppleIDHelperDialog } from './components/AppleIDHelperDialog'
import IOSUUIDDialog from './components/IOSUUIDDialog'

interface DeveloperProfileFormProps {
  developerProfile?: DeveloperProfile
  status?: string
  onSubmit: (developerProfile: DeveloperProfile) => void
}

export const DeveloperProfileForm = ({
  developerProfile,
  status,
  onSubmit,
}: DeveloperProfileFormProps): JSX.Element => {
  const form = useForm<DeveloperFormValues>({
    resolver: zodResolver(developerFormSchema),
    defaultValues: {
      appleID: developerProfile?.appleID || '',
      gitLabUsername: developerProfile?.gitLabUsername || '',
      hasMacBook: developerProfile?.macBookUUID ? 'yes' : 'no',
      macBookUUID: developerProfile?.macBookUUID || '',
      hasIPhone: developerProfile?.iPhoneUUID ? 'yes' : 'no',
      iPhoneUUID: developerProfile?.iPhoneUUID || '',
      hasIPad: developerProfile?.iPadUUID ? 'yes' : 'no',
      iPadUUID: developerProfile?.iPadUUID || '',
      hasAppleWatch: developerProfile?.appleWatchUUID ? 'yes' : 'no',
      appleWatchUUID: developerProfile?.appleWatchUUID || '',
    },
  })

  const handleSubmit = (values: DeveloperFormValues) => {
    const submittedProfile: DeveloperProfile = {
      appleID: values.appleID,
      gitLabUsername: values.gitLabUsername,
      macBookUUID: values.hasMacBook === 'yes' ? values.macBookUUID : undefined,
      iPhoneUUID: values.hasIPhone === 'yes' ? values.iPhoneUUID : undefined,
      iPadUUID: values.hasIPad === 'yes' ? values.iPadUUID : undefined,
      appleWatchUUID: values.hasAppleWatch === 'yes' ? values.appleWatchUUID : undefined,
    }
    onSubmit(submittedProfile)
  }

  return (
    <div>
      {status && <p className='text-muted-foreground mb-4'>{status}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='appleID'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apple ID</FormLabel>
                <FormDescription>
                  Enter the email address associated with your Apple ID. If you do not have an Apple
                  ID you MUST create one.
                </FormDescription>
                <FormControl>
                  <div className='flex items-center space-x-2'>
                    <Input placeholder='example@icloud.com' {...field} className='flex-grow' />
                    <AppleIDHelperDialog />
                  </div>
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
                <FormDescription>
                  Enter your LRZ (!!) GitLab username. Please follow the Info Text where to find
                  your username.
                </FormDescription>
                <FormControl>
                  <div className='flex items-center space-x-2'>
                    <Input placeholder='i.e. ab12cde' {...field} className='flex-grow' />
                    <GitLabHelperDialog />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MacBook section */}
          <FormField
            control={form.control}
            name='hasMacBook'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you have a MacBook?</FormLabel>
                <FormDescription>
                  Please only respond with Yes if you can bring the MacBook to the Intro Course
                  every day. If you do not have access you will get a device from the chair. There
                  are just limited devices and you are NOT allowed to take them home.
                </FormDescription>
                <FormControl>
                  <YesNoButtons value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasMacBook') === 'yes' && (
            <FormField
              control={form.control}
              name='macBookUUID'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MacBook UUID</FormLabel>
                  <FormDescription>
                    Enter your MacBook&apos;s Universally Unique Identifier (UUID).
                  </FormDescription>
                  <FormControl>
                    <div className='flex items-center space-x-2'>
                      <Input
                        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                        {...field}
                        className='flex-grow'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* iPhone section */}
          <FormField
            control={form.control}
            name='hasIPhone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you have an iPhone?</FormLabel>
                <FormControl>
                  <YesNoButtons value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasIPhone') === 'yes' && (
            <FormField
              control={form.control}
              name='iPhoneUUID'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>iPhone UUID</FormLabel>
                  <FormDescription>
                    Enter your iPhone&apos;s Universally Unique Identifier (UUID).
                  </FormDescription>
                  <FormControl>
                    <div className='flex items-center space-x-2'>
                      <Input
                        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                        {...field}
                        className='flex-grow'
                      />
                      <IOSUUIDDialog />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* iPad section */}
          <FormField
            control={form.control}
            name='hasIPad'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you have an iPad?</FormLabel>
                <FormControl>
                  <YesNoButtons value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasIPad') === 'yes' && (
            <FormField
              control={form.control}
              name='iPadUUID'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>iPad UUID</FormLabel>
                  <FormDescription>
                    Enter your iPad&apos;s Universally Unique Identifier (UUID).
                  </FormDescription>
                  <FormControl>
                    <div className='flex items-center space-x-2'>
                      <Input
                        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                        {...field}
                        className='flex-grow'
                      />
                      <IOSUUIDDialog />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Apple Watch section */}
          <FormField
            control={form.control}
            name='hasAppleWatch'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you have an Apple Watch?</FormLabel>
                <FormControl>
                  <YesNoButtons value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasAppleWatch') === 'yes' && (
            <FormField
              control={form.control}
              name='appleWatchUUID'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apple Watch UUID</FormLabel>
                  <FormDescription>
                    Enter your Apple Watch&apos;s Universally Unique Identifier (UUID).
                  </FormDescription>
                  <FormControl>
                    <div className='flex items-center space-x-2'>
                      <Input
                        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                        {...field}
                        className='flex-grow'
                      />
                      <IOSUUIDDialog />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className='flex justify-end mt-3'>
            <Button type='submit' size='lg'>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
