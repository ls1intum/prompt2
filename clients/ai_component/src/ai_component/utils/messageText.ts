import type { AICallMessage } from '../interfaces/aiCallDetail'

export const messageText = (content: AICallMessage['content']): string => {
  if (content === null) return ''
  if (typeof content === 'string') return content
  return content.map((part) => ('text' in part ? part.text : `[${part.type}]`)).join('\n')
}
