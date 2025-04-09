import { UseMutateFunction } from '@tanstack/react-query'
import { debounce } from 'lodash'

export function debounceMutate(
  mutate: UseMutateFunction<any, any, any, unknown>,
  data: any,
  delay: number = 300,
) {
  debounce(mutate(data), delay)
}
