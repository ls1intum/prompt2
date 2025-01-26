import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { UploadButton } from './components/UploadButton'
import { FileUp, UserRoundCheck } from 'lucide-react'

export const MatchingOverviewPage = (): JSX.Element => {
  return (
    <div>
      <ManagementPageHeader>Matching Data Export and Import</ManagementPageHeader>
      <div className='grid md:grid-cols-2 gap-8'>
        <section className='space-y-4'>
          <h2 className='text-2xl font-bold flex items-center'>
            <span className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2'>
              1
            </span>
            Data Export
          </h2>
          <UploadButton
            title='Export Data for TUM Matching'
            description='Upload the file which you have received from TUM Matching to enter the ranks.'
            icon={<FileUp className='h-6 w-6 mr-2' />}
            onUpload={(file) => console.log('Export file uploaded:', file)}
            acceptedFileTypes={['.xlsx']}
          />
        </section>
        <section className='space-y-4'>
          <h2 className='text-2xl font-bold flex items-center'>
            <span className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2'>
              2
            </span>
            Data Re-Import
          </h2>
          <UploadButton
            title='Re-Import Assigned Students'
            description='Upload the students that the TUM Matching System has assigned to this course.'
            icon={<UserRoundCheck className='h-6 w-6 mr-2' />}
            onUpload={(file) => console.log('Import file uploaded:', file)}
            acceptedFileTypes={['.xlsx']}
          />
        </section>
      </div>
    </div>
  )
}
