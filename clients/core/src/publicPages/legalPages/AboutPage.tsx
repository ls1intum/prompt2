import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Bug,
  GitPullRequest,
  Mail,
  FileText,
  UserCheck,
  Users,
  Calendar,
  ImportIcon as FileImport,
  Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Contributors } from './components/Contributors'
import { env } from '@/env'
import { Separator } from '@/components/ui/separator'

export default function AboutPage() {
  const navigate = useNavigate()

  const coreFeatures = [
    {
      icon: Calendar,
      title: 'Course Configuration',
      description:
        'Build a course by assembling various course phases to suit your specific teaching needs.',
    },
    {
      icon: FileText,
      title: 'Application Phase',
      description:
        'Streamline the application process for courses, making it easier for students to apply and for instructors to manage applications.',
    },
    {
      icon: UserCheck,
      title: 'Student Management',
      description:
        'Manage student information and track each student\'s participation history, including applications and course performances, to facilitate informed decision-making.',
    }
  ]

  const dynamicPhases = [
    {
      icon: Users,
      title: 'Interview Phase',
      description:
        'Manage and schedule interviews with applicants as part of the selection process.',
    },
    {
      icon: FileImport,
      title: 'TUM Matching Export',
      description: 'Export data in a format compatible with TUM Matching for seamless integration.',
    },
    {
      icon: Calendar,
      title: 'Team Phase',
      description: 'Assign students to teams and projects, and manage project work throughout the course.',
    },
  ]


  return (
    <div className='container mx-auto py-12 px-4'>
      <Card className='w-full max-w-6xl mx-auto shadow-lg'>
        <CardHeader className='relative pb-8'>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-4 hover:bg-gray-100 transition-colors'
            onClick={() => navigate('/')}
            aria-label='Go back'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <CardTitle className='text-4xl font-bold text-center mt-8'>About PROMPT</CardTitle>
          <CardDescription className='text-center text-lg mt-2'>
            Learn more about our robust course management platform
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-12'>
          <section>
            <h2 className='text-2xl font-semibold mb-4'>What is PROMPT?</h2>
            <p className='text-gray-700 leading-relaxed'>
              PROMPT (Project-Oriented Modular Platform for Teaching) is a flexible and modular course management system designed
              to support a wide range of project-based university courses. 
              It aims to streamline the daily activities of both students and instructors, enhancing the overall learning experience.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              At its core, PROMPT introduces a modular approach to course management, enabling instructors to define and customize
              course phases based on their teaching needs. 
              Through module federation, PROMPT ensures extensibility and allows the tool to be easily expanded to meet the 
              organizational needs of a diverse range of project-based teaching courses.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              Originally developed for the iPraktikum at the Technical University of Munich (TUM), PROMPT has evolved into a
              scalable platform that allows instructors to structure and manage their courses efficiently, regardless of their specific
              format or discipline.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4'>Get in Touch</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[
                {
                  icon: Bug,
                  text: 'Report a bug',
                  link: 'https://github.com/ls1intum/prompt2/issues',
                },
                {
                  icon: GitPullRequest,
                  text: 'Request a feature',
                  link: 'https://github.com/ls1intum/prompt2/issues',
                },
                { icon: Mail, text: 'Contact us', link: 'https://ase.cit.tum.de/impressum/' },
                {
                  icon: FileText,
                  text: 'Release notes',
                  link: 'https://github.com/ls1intum/prompt2/releases',
                },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className='flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <item.icon className='h-5 w-5 mr-3 text-blue-600' />
                  <span className='text-gray-700 hover:text-gray-900'>{item.text}</span>
                </a>
              ))}
            </div>
          </section>

          <Separator />

          <section>
            <h2 className='text-2xl font-semibold mb-6'>Main Features</h2>

            <h3 className='text-xl font-semibold mt-8 mb-3'>Core Features</h3>
            <h4 className='text-l mb-4 text-secondary-foreground'>
              The Core offers a range of essential features designed to enhance the efficiency and effectiveness of course management.
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              {coreFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className='text-lg font-semibold flex items-center'>
                      <feature.icon className='h-5 w-5 mr-2 text-blue-600' />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-gray-700 text-sm'>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className='text-xl font-semibold mb-3'>Dynamically Loaded Course Phases</h3>
            <h4 className='text-l mb-4 text-secondary-foreground'>
              PROMPT allows instructors to create and manage own independent course phases, fostering a collaborative and easily extensible platform for project-based learning.
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dynamicPhases.map((phase, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <phase.icon className="h-5 w-5 mr-2 text-blue-600" />
                      {phase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">{phase.description}</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="md:col-span-3 border-2 border-blue-600">
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center text-blue-600">
                    <Plus className="h-8 w-8 mr-3" />
                    Custom Course Phase
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-lg text-gray-700">
                    Create a custom course phase to meet specific teaching needs. This powerful feature allows you to
                    extend PROMPT's functionality and tailor it to your unique course requirements.
                  </p>
                  <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">Learn More</Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className='text-2xl font-semibold mb-6'>Contributors</h2>
            <Contributors />
          </section>

          <Separator />

          <section>
            <h2 className='text-2xl font-semibold mb-6'>Release Info</h2>
            <ul className='list-disc list-inside text-gray-700'>
              <li>
                <span className='font-semibold'>Github SHA:</span> {env.GITHUB_SHA}
              </li>
              <li>
                <span className='font-semibold'>Github Ref:</span> {env.GITHUB_REF}
              </li>
              <li>
                <span className='font-semibold'>Image Tag:</span> {env.SERVER_IMAGE_TAG}
              </li>
              <li>
                <span className='font-semibold'>License:</span> MIT
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
