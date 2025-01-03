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
import { AssessmentScoreUploadPage3 } from './components/AssessmentScoreUploadPage3'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { AdditionalScore } from '@/interfaces/additional_score'
import { Upload } from 'lucide-react'

interface AssessmentScoreUploadProps {
  applications: ApplicationParticipation[]
}

export default function AssessmentScoreUpload({
  applications,
}: AssessmentScoreUploadProps): JSX.Element {
  const [page, setPage] = useState(1)
  const [additionalScores, setAdditionalScores] = useState<AdditionalScore[]>([])
  const [unmatchedApplications, setUnmatchedApplications] = useState<ApplicationParticipation[]>([])
  const [numberOfBelowThreshold, setNumberOfBelowThreshold] = useState<number | null>(null)
  const [rowsWithError, setRowsWithError] = useState<string[][]>([])
  const page1Ref = useRef<Page1Ref>(null)
  const page2Ref = useRef<Page2Ref>(null)

  const matchStudents = (
    csvData: string[][],
    matchBy: string,
    matchColumn: string,
    scoreColumn: string,
    threshold: number | null,
  ) => {
    const headerRow = csvData[0]
    const matchColumnIndex = headerRow.indexOf(matchColumn)
    const scoreColumnIndex = headerRow.indexOf(scoreColumn)

    if (matchColumnIndex === -1 || scoreColumnIndex === -1) {
      // TODO replace this with a toast message
      console.log('Match column or score column not found in CSV data')
    }

    const matchedApplications: AdditionalScore[] = []
    let belowThreshold: number = 0
    const unmatched: ApplicationParticipation[] = []
    const errorRows: string[][] = []

    errorRows.push(csvData[0]) // Add the header row to the error rows

    applications.forEach((app) => {
      const matchValue = app.student[matchBy as keyof typeof app.student]
      const matchedRow = csvData.find((row) => row[matchColumnIndex] === matchValue)

      if (matchedRow) {
        const score = parseFloat(matchedRow[scoreColumnIndex])
        if (!isNaN(score)) {
          matchedApplications.push({
            coursePhaseParticipationId: app.id,
            score,
          })
          if (threshold !== null && score < threshold) {
            belowThreshold += 1
          }
        } else {
          errorRows.push(matchedRow)
          unmatched.push(app)
        }
      } else {
        unmatched.push(app)
      }
    })

    setAdditionalScores(matchedApplications)
    setUnmatchedApplications(unmatched)
    setRowsWithError(errorRows)

    if (threshold !== null) {
      setNumberOfBelowThreshold(belowThreshold)
    } else {
      setNumberOfBelowThreshold(null)
    }
  }

  const handleNext = () => {
    if (page === 1) {
      if (page1Ref.current?.validate()) {
        setPage(2)
      }
    } else if (page === 2) {
      if (page2Ref.current?.validate()) {
        const page1Values = page1Ref.current?.getValues()
        const page2Values = page2Ref.current?.getValues()
        console.log(page1Values, page2Values)
        if (page1Values && page2Values) {
          console.log('trying to match students')
          matchStudents(
            page2Values.csvData,
            page2Values.matchBy,
            page2Values.matchColumn,
            page2Values.scoreColumn,
            page1Values.hasThreshold ? parseFloat(page1Values.threshold) : null,
          )
          setPage(3)
        }
      }
    } else {
      console.log({
        additionalScores,
      })
      // TODO: sync with server + toast error / success message
    }
  }

  const handlePrevious = () => {
    if (page === 2) {
      setPage(1)
    } else if (page === 3) {
      setPage(2)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className='h-4 w-4 mr-2' />
          Upload Scores
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[900px] w-[90vw]'>
        <DialogHeader>
          <DialogTitle>Upload Assessment Scores</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <div style={{ display: page === 1 ? 'block' : 'none' }}>
            <AssessmentScoreUploadPage1 ref={page1Ref} />
          </div>
          <div style={{ display: page === 2 ? 'block' : 'none' }}>
            <AssessmentScoreUploadPage2 ref={page2Ref} />
          </div>
          <div style={{ display: page === 3 ? 'block' : 'none' }}>
            <AssessmentScoreUploadPage3
              matchedCount={additionalScores.length}
              unmatchedApplications={unmatchedApplications}
              belowThreshold={numberOfBelowThreshold}
              rowsWithError={rowsWithError}
            />
          </div>
        </div>
        <div className='mt-4 flex justify-between'>
          <Button onClick={handlePrevious} disabled={page === 1}>
            Previous
          </Button>
          <Button onClick={handleNext}>{page === 3 ? 'Submit' : 'Next'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
