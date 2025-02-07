import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const contributorMapping = {
  niclasheun: {
    name: 'Niclas Heun',
    contribution: 'Lead Developer & Architect of PROMPT 2.0',
    position: 2,
  },
  Mtze: { name: 'Matthias Linhuber', contribution: 'Project Manager', position: 1 },
  mathildeshagl: {
    name: 'Mathilde Hagl',
    contribution: 'Templating and Task Management',
    position: 4,
  },
  airelawaleria: {
    name: 'Valeryia Andraichuk',
    contribution: 'Creator of PROMPT - the concept on which PROMPT 2.0 is based',
    position: 3,
  },
  rappm: { name: 'Maximilian Rapp', contribution: 'Grading', position: 5 },
}

export const Contributors = () => {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [vali, setVali] = useState<Contributor>()

  useEffect(() => {
    fetch('https://api.github.com/repos/ls1intum/prompt2/contributors')
      .then((response) => response.json())
      .then((data) => setContributors(data))
      .catch((error) => console.error('Error fetching contributors:', error))
  }, [])

  useEffect(() => {
    fetch('https://api.github.com/users/airelawaleria')
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setVali({
            login: data.login,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            contributions: 0, // Contributions are not available from this endpoint
            type: data.type,
          })
        }
      })
      .catch((error) => console.error('Error fetching user:', error))
  }, [])

  const mappedContributors: ContributorWithInfo[] = [...contributors, vali]
    .filter(
      (contributor) =>
        contributor !== undefined &&
        contributorMapping[contributor.login] &&
        contributor.type === 'User',
    )
    .map((contributor) => {
      if (contributor === undefined) {
        return
      }
      return {
        ...contributor,
        ...contributorMapping[contributor?.login],
      }
    })

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {mappedContributors
        .sort((a, b) => a.position - b.position)
        .map((contributor, index) => (
          <Card key={index}>
            <CardContent className='flex items-center p-4'>
              <Avatar className='w-16 h-16 mr-4'>
                <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                <AvatarFallback>{contributor.login.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <a
                  href={contributor.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline font-semibold'
                >
                  {contributor.name}
                </a>
                <p className='text-sm text-gray-600 mt-1'>{contributor.contribution}</p>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
