import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UpcomingCarousel } from './components/UpcomingCarousel'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className='container mx-auto py-8 px-4'>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader className='relative'>
          <Button variant='ghost' size='icon' className='absolute left-4 top-4' onClick={() => navigate('/')} aria-label='Go back'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <CardTitle className='text-3xl font-bold text-center'>About PROMPT</CardTitle>
          <CardDescription className='text-center'>Learn more about our PROMPT</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <h2 className="text-xl font-semibold mb-2">What is PROMPT?</h2>
          <p>
            PROMPT is a robust course management platform designed to seamlessly support most university project-based
            courses with minimal adaptations, offering a simple yet powerful tool to help you manage your projects and
            tasks.
          </p>

          <h2 className="text-xl font-semibold mb-2">Get in Touch</h2>
          <ul className='list-disc list-inside'>
            <li>
              <a
                href='https://github.com/ls1intum/prompt2/issues'
                className='text-blue-600 underline hover:text-blue-800'
                target='_blank'
                rel='noopener noreferrer'
              >
                Report a bug
              </a>
            </li>
            <li>
              <a
                href='https://github.com/ls1intum/prompt2/issues'
                className='text-blue-600 underline hover:text-blue-800'
                target='_blank'
                rel='noopener noreferrer'
              >
                Request a feature
              </a>
            </li>
            <li>
              <a
                href='https://ase.cit.tum.de/impressum/'
                className='text-blue-600 underline hover:text-blue-800'
                target='_blank'
                rel='noopener noreferrer'
              >
                Contact us
              </a>
            </li>
            <li>
              <a
                href='https://github.com/ls1intum/prompt2/releases'
                className='text-blue-600 underline hover:text-blue-800'
                target='_blank'
                rel='noopener noreferrer'
              >
                Release notes
              </a>
            </li>
          </ul>


          <h2 className="text-xl font-semibold mb-2">Main Features </h2>
          <h3 className='text-xl font-bold'>Application Phase Module</h3>

          <h3 className='text-xl font-bold'>Infrastructure Interface</h3>
          <p>
            Manage the creation of GitLab repositories for students in a certain course phase and assign groups of
            students to a Keycloak group. This will allow students to access the GitLab repositories and the course
            infrastructure.
          </p>

          <h3 className='text-xl font-bold'>Student Performance Tracking</h3>
          <p>
            Our goal is to create a comprehensive system that tracks each student's entire participation history,
            including
            applications and course performances. This system will streamline application assessments and provide
            instructors
            with a comprehensive view of each student's academic journey, facilitating more informed
            decision-making.
          </p>
          <p>
            Additionally, we plan to implement a global recommendation system that allows instructors to recommend
            students
            for other courses based on their performance history. This system will also enable instructors to add
            context to
            their recommendations, such as specific skill sets or areas of expertise.
          </p>

          <h2 className='text-2xl font-bold'>Upcoming Functionality</h2>
          <div className="px-10 space-y-8">
            <UpcomingCarousel />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
