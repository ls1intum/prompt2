import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AssessmentScoreUploadPage1, Page1Ref } from './components/AssessmentScoreUploadPage1'
import { AssessmentScoreUploadPage2, Page2Ref } from './components/AssessmentScoreUploadPage2'

export default function AssessmentScoreUpload() {
  const [page, setPage] = useState(1)
  const page1Ref = useRef<Page1Ref>(null)
  const page2Ref = useRef<Page2Ref>(null)

  const handleNext = () => {
    if (page === 1) {
      if (page1Ref.current?.validate()) {
        setPage(2)
      }
    } else {
      if (page2Ref.current?.validate()) {
        // Handle form submission
        const page1Values = page1Ref.current?.getValues()
        const page2Values = page2Ref.current?.getValues()
        console.log({
          ...page1Values,
          ...page2Values,
        })
        // Close the dialog or show a success message
      }
    }
  }

  const handlePrevious = () => {
    if (page === 2) {
      setPage(1)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload Assessment Scores</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px] w-[90vw]'>
        <DialogHeader>
          <DialogTitle>Upload Assessment Scores</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          {page === 1 ? (
            <AssessmentScoreUploadPage1 ref={page1Ref} />
          ) : (
            <AssessmentScoreUploadPage2 ref={page2Ref} />
          )}
        </div>
        <div className='mt-4 flex justify-between'>
          <Button onClick={handlePrevious} disabled={page === 1}>
            Previous
          </Button>
          <Button onClick={handleNext}>{page === 2 ? 'Submit' : 'Next'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
