'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className='container mx-auto py-8 px-4'>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader className='relative'>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-4'
            onClick={() => navigate('/')}
            aria-label='Go back'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <CardTitle className='text-3xl font-bold text-center'>About PROMPT</CardTitle>
          <CardDescription className='text-center'>Learn more about our PROMPT</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Under Construction</AlertTitle>
            <AlertDescription>
              This page is still being built. More information will be available soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
