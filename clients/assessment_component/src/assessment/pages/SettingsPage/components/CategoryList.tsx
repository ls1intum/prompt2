import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CategoryWithCompetencies } from '../../../interfaces/category'
import { useGetAllCategoriesWithCompetencies } from '../../hooks/useGetAllCategoriesWithCompetencies'

export const CategoryList = () => {
  const { data: categories, isLoading, isError } = useGetAllCategoriesWithCompetencies()

  if (isLoading) return <p>Loading...</p>
  if (isError || !categories) return <p>Failed to load data.</p>
  if (categories.length === 0) return <p>No categories found.</p>

  return (
    <div className='space-y-4'>
      {categories.map((category) => (
        <Card key={category.id} className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-semibold text-lg'>{category.name}</p>
              {category.description && (
                <p className='text-muted-foreground text-sm'>{category.description}</p>
              )}
            </div>
          </div>

          <Accordion type='single' collapsible className='mt-4'>
            <AccordionItem value='competencies'>
              <AccordionTrigger>Show Competencies</AccordionTrigger>
              <AccordionContent className='space-y-2'>
                {category.competencies.map((competency) => (
                  <div
                    key={competency.id}
                    className='flex items-center justify-between border p-2 rounded-md'
                  >
                    <div className='flex-1 font-medium'>{competency.name}</div>
                    <div className='text-sm text-muted-foreground flex-1'>
                      {competency.description}
                    </div>
                    <div className='text-xs flex-1 text-right'>
                      <span className='block'>🟢 Novice: {competency.novice}</span>
                      <span className='block'>🟡 Intermediate: {competency.intermediate}</span>
                      <span className='block'>🔵 Advanced: {competency.advanced}</span>
                      <span className='block'>🟣 Expert: {competency.expert}</span>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}
    </div>
  )
}
