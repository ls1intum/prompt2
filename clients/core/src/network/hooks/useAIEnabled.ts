import { coreApi } from '@core/network/api'
import { coreKeys } from '@core/network/cache'
import { useQuery } from '@tanstack/react-query'

// Not deployed, unreachable or unhealthy all hide the AI surfaces alike.
export const useAIEnabled = (): boolean => {
  const { data } = useQuery({
    queryKey: coreKeys.ai.info(),
    queryFn: coreApi.ai.info,
    retry: false,
    staleTime: 60_000,
  })
  return data?.serviceName === 'ai' && data.healthy === true
}
