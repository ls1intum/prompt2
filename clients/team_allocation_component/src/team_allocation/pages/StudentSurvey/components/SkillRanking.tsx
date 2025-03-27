import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Star } from 'lucide-react'
import { Skill } from 'src/team_allocation/interfaces/skill'

interface SkillRankingProps {
  skills: Skill[]
  skillRatings: Record<string, number>
  setSkillRatings: React.Dispatch<React.SetStateAction<Record<string, number>>>
}

export const SkillRanking = ({
  skills,
  skillRatings,
  setSkillRatings,
}: SkillRankingProps): JSX.Element => {
  const handleSkillRatingChange = (skillID: string, rating: number) => {
    setSkillRatings({ ...skillRatings, [skillID]: rating })
  }

  return (
    <Card>
      <CardHeader className='bg-muted/50'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5 text-primary' />
              Skill Assessment
            </CardTitle>
            <CardDescription>
              Rate your proficiency in each skill from 1 (beginner) to 5 (expert)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='space-y-6'>
          {skills.map((skill) => (
            <div key={skill.id} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{skill.name}</span>
              </div>
              <RadioGroup
                value={String(skillRatings[skill.id] || 3)}
                onValueChange={(value) => handleSkillRatingChange(skill.id, Number(value))}
                className='flex justify-between gap-2 pt-1'
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <div key={val} className='flex flex-col items-center gap-1'>
                    {val === 1 && (
                      <span className='text-xs text-muted-foreground mb-1'>Beginner</span>
                    )}
                    {val === 3 && (
                      <span className='text-xs text-muted-foreground mb-1'>Intermediate</span>
                    )}
                    {val === 5 && (
                      <span className='text-xs text-muted-foreground mb-1'>Expert</span>
                    )}
                    {val !== 1 && val !== 3 && val !== 5 && (
                      <span className='text-xs text-muted-foreground mb-1 invisible'>
                        Placeholder
                      </span>
                    )}
                    <RadioGroupItem
                      value={String(val)}
                      id={`${skill.id}-${val}`}
                      className='h-5 w-5'
                    />
                    <label
                      htmlFor={`${skill.id}-${val}`}
                      className='text-xs text-muted-foreground cursor-pointer'
                    >
                      {val}
                    </label>
                  </div>
                ))}
              </RadioGroup>
              <Separator className='mt-4' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
