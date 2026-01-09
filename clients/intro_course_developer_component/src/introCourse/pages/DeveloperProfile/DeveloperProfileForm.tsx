import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PostDeveloperProfile } from '../../interfaces/PostDeveloperProfile'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useScreenSize,
} from '@tumaet/prompt-ui-components'
import { YesNoButtons } from '../../components/YesNoButtons'
import { developerFormSchema, type DeveloperFormValues } from '../../validations/developerProfile'
import { GitLabHelperDialog } from './components/GitLabHelperDialog'
import { AppleIDHelperDialog } from './components/AppleIDHelperDialog'
import IOSUDIDDialog from './components/IOSUDIDDialog'
import { DeveloperProfile } from '../../interfaces/DeveloperProfile'

interface DeveloperProfileFormProps {
  developerProfile?: DeveloperProfile
  status?: string
  onSubmit: (developerProfile: PostDeveloperProfile) => void
}

export const DeveloperProfileForm = ({
  developerProfile,
  status,
  onSubmit,
}: DeveloperProfileFormProps) => {
  const { width } = useScreenSize()

  const form = useForm<DeveloperFormValues>({
    resolver: zodResolver(developerFormSchema),
    defaultValues: {
      appleID: developerProfile?.appleID || '',
      gitLabUsername: developerProfile?.gitLabUsername || '',
      hasMacBook: developerProfile?.hasMacBook,
      hasIPhone:
        developerProfile?.iPhoneUDID === undefined
          ? undefined
          : developerProfile?.iPhoneUDID !== '',
      iPhoneUDID: developerProfile?.iPhoneUDID || '',
      hasIPad:
        developerProfile?.iPadUDID === undefined ? undefined : developerProfile?.iPadUDID !== '',
      iPadUDID: developerProfile?.iPadUDID || '',
      hasAppleWatch:
        developerProfile?.appleWatchUDID === undefined
          ? undefined
          : developerProfile?.appleWatchUDID !== '',
      appleWatchUDID: developerProfile?.appleWatchUDID || '',
    },
  })

  const handleSubmit = (values: DeveloperFormValues) => {
    const submittedProfile: PostDeveloperProfile = {
      appleID: values.appleID,
      gitLabUsername: values.gitLabUsername,
      hasMacBook: values.hasMacBook,
      iPhoneUDID: values.hasIPhone ? values.iPhoneUDID : undefined,
      iPadUDID: values.hasIPad ? values.iPadUDID : undefined,
      appleWatchUDID: values.hasAppleWatch ? values.appleWatchUDID : undefined,
    }
    onSubmit(submittedProfile)
  }

  return (
    <div>
      {status && <p className='text-muted-foreground mb-4'>{status}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          {/* Apple ID Field */}
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

          {/* GitLab Username Field */}
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

          {/* MacBook Section */}
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

          {/* iPhone Section: Yes/No + UDID Input */}
          <div className={`grid ${width > 800 ? 'grid-cols-4' : 'grid-cols-1'} gap-4 items-center`}>
            <div>
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
            </div>
            {form.watch('hasIPhone') && (
              <div className='col-span-3 h-full flex flex-col justify-end'>
                <FormField
                  control={form.control}
                  name='iPhoneUDID'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <Input
                            placeholder="Enter your iPhone's UDID."
                            {...field}
                            className='w-full'
                          />
                          <IOSUDIDDialog />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* iPad Section: Yes/No + UDID Input */}
          <div className={`grid ${width > 800 ? 'grid-cols-4' : 'grid-cols-1'} gap-4 items-center`}>
            <div>
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
            </div>
            {form.watch('hasIPad') && (
              <div className='col-span-3 h-full flex flex-col justify-end'>
                <FormField
                  control={form.control}
                  name='iPadUDID'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <Input
                            placeholder="Enter your iPad's UDID."
                            {...field}
                            className='w-full'
                          />
                          <IOSUDIDDialog />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Apple Watch Section: Yes/No + UDID Input */}
          <div className={`grid ${width > 800 ? 'grid-cols-4' : 'grid-cols-1'} gap-4 items-center`}>
            <div>
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
            </div>
            {form.watch('hasAppleWatch') && (
              <div className='col-span-3 h-full flex flex-col justify-end'>
                <FormField
                  control={form.control}
                  name='appleWatchUDID'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <Input
                            placeholder="Enter your Apple Watch's UDID."
                            {...field}
                            className='w-full'
                          />
                          <IOSUDIDDialog />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

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
