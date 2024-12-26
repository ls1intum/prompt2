import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GraduationCap } from 'lucide-react'
import translations from '@/lib/translations.json'
import { useNavigate } from 'react-router-dom'

interface ApplicationLoginCardProps {
  externalStudentsAllowed: boolean
  onContinueAsExtern: () => void
}

export const ApplicationLoginCard = ({
  externalStudentsAllowed,
  onContinueAsExtern,
}: ApplicationLoginCardProps): JSX.Element => {
  const navigate = useNavigate()
  const path = window.location.pathname

  return (
    <Card>
      <CardHeader>
        <CardTitle>Please log in to continue:</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {!externalStudentsAllowed && (
          <p className='text-yellow-600 bg-yellow-50 p-3 rounded-md'>
            This course is only open for {translations.university.name} students. If you cannot log
            in, please reach out to the instructor of the course.
          </p>
        )}
        <div className='space-y-4'>
          <p>
            Are you a {translations.university.name} student? Then please log in using your{' '}
            {translations.university['login-name']}.
          </p>
          <Button
            className='w-full bg-[#0065BD] hover:bg-[#005299] text-white'
            size='lg'
            onClick={() => navigate(path + '/authenticated')}
          >
            <GraduationCap className='mr-2 h-5 w-5' />
            Log in with {translations.university['login-name']}
          </Button>
        </div>
        {externalStudentsAllowed && (
          <>
            <Separator className='my-4' />
            <div className='space-y-4'>
              <p>Are you an external student?</p>
              <Button variant='outline' className='w-full' onClick={onContinueAsExtern}>
                Continue without a {translations.university.name}-Account
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
