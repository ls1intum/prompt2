import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { CreateCompetencyForm } from './CreateCompetencyForm'
import { useCategoryStore } from '../../../zustand/useCategoryStore'

export const CategoryList = () => {
  const { categories } = useCategoryStore()

  return (
    <div className='space-y-6'>
      {categories.map((category) => (
        <Card key={category.id} className='p-6 overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='competencies' className='border-none'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-semibold tracking-tight'>{category.name}</h2>
                  {category.description && (
                    <p className='text-muted-foreground text-sm mt-1'>{category.description}</p>
                  )}
                </div>
                <AccordionTrigger className='py-3 hover:no-underline'>
                  <span className='text-sm font-medium'>Show Competencies</span>
                </AccordionTrigger>
              </div>
              <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
                {category.competencies.length === 0 ? (
                  <p className='text-sm text-muted-foreground italic'>
                    No competencies available yet.
                  </p>
                ) : (
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {category.competencies.map((competency) => (
                      <div
                        key={competency.id}
                        className='rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md'
                      >
                        <div className='text-base font-medium mb-2 flex items-center gap-2'>
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                          {competency.name}
                        </div>
                        <div className='text-sm text-muted-foreground mb-3'>
                          {competency.description}
                        </div>
                        <div className='text-xs grid grid-cols-4 gap-x-2'>
                          <div className='space-y-1'>
                            <div className='font-semibold'>Novice</div>
                            <div>{competency.novice}</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='font-semibold'>Intermediate</div>
                            <div>{competency.intermediate}</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='font-semibold'>Advanced</div>
                            <div>{competency.advanced}</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='font-semibold'>Expert</div>
                            <div>{competency.expert}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className='py-4 border-t mt-2'>
                  <CreateCompetencyForm categoryID={category.id} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}
    </div>
  )
}
