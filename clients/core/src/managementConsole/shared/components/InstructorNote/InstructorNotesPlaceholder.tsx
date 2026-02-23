import { NotepadText } from 'lucide-react'

type PlaceholderNoteProps = {
  initials: string
  author: string
  time: string
  opacity?: string
  children: React.ReactNode
}

function PlaceholderNote({
  initials,
  author,
  time,
  opacity = 'opacity-60',
  children,
}: PlaceholderNoteProps) {
  return (
    <div className={`flex gap-4 ${opacity}`}>
      <div>
        <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold leading-none select-none '>
          {initials}
        </div>
      </div>
      <div className='space-y-1'>
        <div className='text-sm font-medium'>
          {author} · {time}
        </div>
        {children}
      </div>
    </div>
  )
}

export function InstructorNotesPlacholder() {
  return (
    <div className='flex flex-col relative p-2'>
      <div className='flex flex-col items-center justify-center w-80 px-4 py-12 border rounded-2xl absolute top-[190px] left-1/2 -translate-x-1/2 z-20 backdrop-blur-lg'>
        <NotepadText className='w-10 h-10' />
        <h3 className='font-bold text-xl'>Instructor Notes</h3>
        <p className='text-center'>No Instructor Notes for this student. Create one</p>
      </div>

      <div className='z-0 flex flex-col gap-6 text-muted-foreground [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]'>
        <PlaceholderNote initials='ML' author='Matthias L' time='2 weeks ago'>
          <p className='text-sm leading-relaxed'>
            Student participates actively and asks thoughtful questions during sessions.
          </p>
        </PlaceholderNote>

        <PlaceholderNote initials='MR' author='Maximilian R' time='1 month ago'>
          <p className='text-sm leading-relaxed'>
            Good progress overall. Occasionally struggles with deadlines but communicates early.
          </p>
          <p className='text-sm leading-relaxed'>Team collaboration was constructive.</p>
        </PlaceholderNote>

        <PlaceholderNote
          initials='MH'
          author='Matthilde H'
          time='5 months ago'
          opacity='opacity-50'
        >
          <p className='text-sm leading-relaxed'>
            Demonstrates strong analytical skills. Written submissions are consistently well
            structured.
          </p>
        </PlaceholderNote>

        <PlaceholderNote initials='SK' author='Stephan K' time='6 months ago' opacity='opacity-40'>
          <p className='text-sm leading-relaxed'>
            Reliable attendance and respectful interaction with peers and staff.
          </p>
        </PlaceholderNote>

        <PlaceholderNote initials='JS' author='Josef S' time='4 months ago' opacity='opacity-50'>
          <p className='text-sm leading-relaxed'>
            Initially quiet, but showed significant improvement in participation over time.
          </p>
        </PlaceholderNote>

        <PlaceholderNote initials='PN' author='Phillip N' time='3 months ago'>
          <p className='text-sm leading-relaxed'>Always great working with him.</p>
        </PlaceholderNote>

        <PlaceholderNote initials='LK' author='Ludwig K' time='3 months ago'>
          <p className='text-sm leading-relaxed'>Submitted all required materials on time.</p>
        </PlaceholderNote>
      </div>
    </div>
  )
}
