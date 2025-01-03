import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Equal, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import translations from '@/lib/translations.json'

export default function AssessmentScoreUpload() {
  const [page, setPage] = useState(1)
  const [scoreName, setScoreName] = useState('')
  const [inputType, setInputType] = useState<'number' | 'percentage'>('number')
  const [hasThreshold, setHasThreshold] = useState(false)
  const [threshold, setThreshold] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [matchBy, setMatchBy] = useState<'email' | 'tumId' | 'matrNr'>('email')
  const [matchColumn, setMatchColumn] = useState('')
  const [scoreColumn, setScoreColumn] = useState('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFile = event.target.files?.[0]
    if (uploadFile) {
      setFile(uploadFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text
          .split('\n')
          .map((row) => row.split(',').map((value) => value.replace(/"/g, '')))
        setCsvData(rows)
      }
      reader.readAsText(uploadFile)
    }
  }

  const renderPage1 = () => (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <Label htmlFor='scoreName'>Name for the new score</Label>
        <Input
          id='scoreName'
          value={scoreName}
          onChange={(e) => setScoreName(e.target.value)}
          placeholder='e.g., Midterm Exam'
        />
      </div>

      <div className='space-y-4'>
        <Label>Select input type</Label>
        <RadioGroup
          value={inputType}
          onValueChange={(value: 'number' | 'percentage') => setInputType(value)}
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='number' id='number' />
            <Label htmlFor='number'>Number</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='percentage' id='percentage' />
            <Label htmlFor='percentage'>Percentage</Label>
          </div>
        </RadioGroup>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Switch id='threshold' checked={hasThreshold} onCheckedChange={setHasThreshold} />
          <Label htmlFor='threshold'>Set acceptance threshold</Label>
        </div>
        {hasThreshold && (
          <div className='space-y-2'>
            <Input
              type='number'
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={inputType === 'percentage' ? 'e.g., 60' : 'e.g., 70'}
            />
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Students with a score below this threshold will be automatically rejected.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )

  const renderPage2 = () => (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <Label htmlFor='csvUpload'>Upload CSV file</Label>
        <div className='flex items-center space-x-2'>
          <Input id='csvUpload' type='file' accept='.csv' onChange={handleFileUpload} />
          <Button type='button' size='icon'>
            <Upload className='h-4 w-4' />
          </Button>
        </div>
        {file && <p className='text-sm text-muted-foreground'>File uploaded: {file.name}</p>}
      </div>

      {csvData.length > 0 && (
        <>
          <div className='space-y-4'>
            <div className='flex items-end space-x-4'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='matchBy'>Match students by</Label>
                <Select
                  value={matchBy}
                  onValueChange={(value: 'email' | 'tumId' | 'matrNr') => setMatchBy(value)}
                >
                  <SelectTrigger id='matchBy'>
                    <SelectValue placeholder='Select matching criteria' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='university_login'>
                      {translations.university['login-name']}
                    </SelectItem>
                    <SelectItem value='matriculation_number'>Matriculation Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center pb-2'>
                <Equal className='h-6 w-6 text-muted-foreground' />
              </div>

              <div className='flex-1 space-y-2'>
                <Label htmlFor='matchColumn'>Select column to match by</Label>
                <Select value={matchColumn} onValueChange={setMatchColumn}>
                  <SelectTrigger id='matchColumn'>
                    <SelectValue placeholder='Select a column' />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData?.[0]?.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <Label htmlFor='scoreColumn'>Select column for scores</Label>
            <Select value={scoreColumn} onValueChange={setScoreColumn}>
              <SelectTrigger id='scoreColumn'>
                <SelectValue placeholder='Select a column' />
              </SelectTrigger>
              <SelectContent>
                {csvData[0]?.map((header, index) => (
                  <SelectItem key={index} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='mt-4 h-[300px] sm:max-w-[650px] w-[85vw] overflow-hidden flex flex-col'>
            <h4 className='text-sm font-medium mb-2'>CSV Preview</h4>
            <div className='overflow-x-auto overflow-y-auto flex-grow'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvData[0].map((header, index) => (
                      <TableHead key={index} className='min-w-[150px] bg-muted'>
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(1, 6).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className='break-words'>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const handleNext = () => {
    if (page === 1) {
      setPage(2)
    } else {
      // Handle form submission
      console.log({
        scoreName,
        inputType,
        hasThreshold,
        threshold,
        matchBy,
        matchColumn,
        scoreColumn,
        file,
      })
      // Close the dialog or show a success message
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
        <div className='mt-4'>{page === 1 ? renderPage1() : renderPage2()}</div>
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
