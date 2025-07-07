import { Category } from '../../../interfaces/category'

interface CategoryEvaluationProps {
  category: Category
}

export const CategoryEvaluation = ({ category }: CategoryEvaluationProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>Category Evaluation</h2>
      {/* Add your category evaluation logic here */}
      {category.name}
    </div>
  )
}
