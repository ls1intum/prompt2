import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

export const Header = (): JSX.Element => (
  <div className='flex flex-col sm:flex-row justify-between items-center mb-12 gap-4'>
    <div className='flex items-center space-x-4'>
      <img src='/ase.jpeg' alt='TUM Logo' className='h-12 w-12' />
      <h1 className='text-xl'>Applied Education Technologies</h1>
    </div>
    <Button variant='outline' className='flex items-center space-x-2'>
      <LogIn className='h-4 w-4' />
      <span>Chair Member Login</span>
    </Button>
  </div>
)
