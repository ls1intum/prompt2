import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { JSX } from 'react/jsx-runtime'

interface RankingOptionsProps {
  onRankingChange: (useScoreAsRank: boolean) => void
  useScoreAsRank: boolean
}

export const RankingOptions = ({
  onRankingChange,
  useScoreAsRank = true,
}: RankingOptionsProps): JSX.Element => {
  const handleChange = (value: string) => {
    const newValue = value === 'score'
    onRankingChange(newValue)
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg'>Ranking Options</CardTitle>
        <CardDescription>Select how you want to rank students in the exported data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={useScoreAsRank ? 'score' : 'same'}
          onValueChange={handleChange}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='score'>Use Score as Rank</TabsTrigger>
            <TabsTrigger value='same'>Same Rank for All</TabsTrigger>
          </TabsList>
          <TabsContent value='score' className='mt-4'>
            <div className='rounded-md border p-4 bg-muted/20'>
              <p className='text-sm text-muted-foreground'>
                Students will be ranked based on their individual scores. A lower score will
                translate to a better ranking. 1 represents the best possible score.
              </p>
            </div>
          </TabsContent>
          <TabsContent value='same' className='mt-4'>
            <div className='rounded-md border p-4 bg-muted/20'>
              <p className='text-sm text-muted-foreground'>
                All students will be assigned the same rank regardless of their scores.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
