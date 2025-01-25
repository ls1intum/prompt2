'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import DOMPurify from 'dompurify'

export default function AboutPage() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')

  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    // set all elements owning target to target=_blank
    if ('target' in node) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener')
    }
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    fetch('/about.html')
      .then((res) => res.text())
      .then((res) => DOMPurify.sanitize(res))
      .then((res) => setContent(res))
  }, [])

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
          
          <div className='about' dangerouslySetInnerHTML={{ __html: content }} />


          <h2 className='px-6 text-2xl font-bold'>Upcoming Functionality</h2>
          <div className="px-10 space-y-8">
            <Carousel>
              <CarouselPrevious />
              <CarouselContent>
                <CarouselItem>
                  <Card></Card>
                  Grading
                </CarouselItem>
                <CarouselItem>Templating</CarouselItem>
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
