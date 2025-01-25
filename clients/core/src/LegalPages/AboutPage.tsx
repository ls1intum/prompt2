'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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

          <h2 className='text-2xl font-bold'>What is PROMPT?</h2>
          <p>
            PROMPT is a tool to help you manage your projects and tasks. It is designed to be simple
            and easy to use, while still being powerful enough to handle all your needs.
          </p>

          <h2 className='text-2xl font-bold'>Why use PROMPT?</h2>
          <p>
            PROMPT is built with you in mind. We want to help you get things done, without getting in
            your way. We believe that the best tools are the ones that you don't notice, because they
            just work.
          </p>

          <h2 className='text-2xl font-bold'>Who is behind PROMPT?</h2>
          <p>
            placeholder
          </p>

          <h2 className='text-2xl font-bold'>Capabilites of Prompt</h2>
          <h3 className='text-xl font-bold'>Task Management</h3>
          <p>
            placeholder
          </p>

          <h3 className='text-xl font-bold'>Task Management</h3>
          <p>
            placeholder
          </p>

          <h3 className='text-xl font-bold'>Task Management</h3>
          <p>
            placeholder
          </p>

          <h2 className='text-2xl font-bold'>Upcoming Functionality</h2>
          <Carousel>
            <CarouselContent>
              <CarouselItem>Grading</CarouselItem>
              <CarouselItem>Templating</CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </div>
  )
}
