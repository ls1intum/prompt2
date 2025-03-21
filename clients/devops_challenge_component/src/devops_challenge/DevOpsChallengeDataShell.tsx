import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import { useEffect, useState } from 'react'
import { useDevOpsChallengeStore } from './zustand/useDevOpsChallengeStore'
import { getDeveloperProfile } from './network/queries/getDeveloperProfile'
import { DeveloperProfile } from './interfaces/DeveloperProfile'
import { ErrorPage } from '@/components/ErrorPage'

interface DevOpsChallengeDataShellProps {
    children: React.ReactNode
}

export const DevOpsChallengeDataShell = ({ children }: DevOpsChallengeDataShellProps): JSX.Element => {
    const { isStudentOfCourse } = useCourseStore()
    const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
    const isStudent = isStudentOfCourse(courseId ?? '')

    const { setCoursePhaseParticipation, setDeveloperProfile } = useDevOpsChallengeStore()

    const [devProfileSet, setDevProfileSet] = useState(false)
    const [participationSet, setParticipationSet] = useState(false)

    const [loading, setLoading] = useState(true)
    const [githubHandle, setGithubHandle] = useState("")


    // getting the course phase participation
    const {
        data: fetchedParticipation,
        error,
        isPending: isParticipationPending,
        isError: isParticipationError,
        refetch: refetchParticipation,
    } = useQuery<CoursePhaseParticipationWithStudent>({
        queryKey: ['course_phase_participation', phaseId],
        queryFn: () => getOwnCoursePhaseParticipation(phaseId ?? ''),
    })

    // trying to get the developerProfile
    const {
        data: fetchedProfile,
        isPending: isProfilePending,
        isError: isProfileError,
        refetch: refetchProfile,
    } = useQuery<DeveloperProfile>({
        queryKey: ["developer_profile"],
        queryFn: () => getDeveloperProfile(phaseId ?? ''),
        enabled: githubHandle !== "",
    })

    const isPending =
        isParticipationPending || !participationSet
    const isError = isParticipationError || isProfileError

    useEffect(() => {
        if (fetchedParticipation) {
            setCoursePhaseParticipation(fetchedParticipation)
            setParticipationSet(true)
        }
    }, [fetchedParticipation, setCoursePhaseParticipation])

    useEffect(() => {
        if (fetchedProfile) {
            setDeveloperProfile(fetchedProfile)
            setDevProfileSet(true)
        }
    }, [fetchedProfile, setDeveloperProfile])

    // if he is not a student -> we do not wait for the participation
    if (isStudent && isPending) {
        return (
            <div className='flex justify-center items-center h-64'>
                <Loader2 className='h-12 w-12 animate-spin text-primary' />
            </div>
        )
    }

    // Data only relevant for students - not for lecturers
    if (isStudent && isError) {
        // if the participation is not found, we show the unauthorized page bc then the student has not yet processed to this phase
        if (isParticipationError && error.message.includes('404')) {
            return <UnauthorizedPage backUrl={`/management/course/${courseId}`} />
        } else {
            return (
                <ErrorPage
                    onRetry={() => {
                        refetchProfile()
                        refetchParticipation()
                    }}
                />
            )
        }
    }

    return (
        <>
            {!isStudent && (
                <Alert>
                    <TriangleAlert className='h-4 w-4' />
                    <AlertTitle>Your are not a student of this course.</AlertTitle>
                    <AlertDescription>
                        The following components are disabled because you are not a student of this course. For
                        configuring this view, please refer to the Intro Course in the Tutor Course.
                    </AlertDescription>
                </Alert>
            )}
            {children}
        </>
    )
}