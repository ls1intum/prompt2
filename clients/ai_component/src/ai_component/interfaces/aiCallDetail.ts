import type { AICall } from './aiCall'
import type { AICallEvent } from './aiCallEvent'

export enum AICallContentState {
  AVAILABLE = 'available',
  RESTRICTED = 'restricted',
  UNAVAILABLE = 'unavailable',
}

export type AICallContentPart = { type: 'text'; text: string } | { type: string }

export interface AICallMessage {
  role: string
  content: string | AICallContentPart[] | null
}

export interface AICallToolCall {
  id: string
  name: string
  arguments: string
}

export interface AICallChoice {
  index: number
  content: string
  refusal?: string
  toolCalls?: AICallToolCall[]
}

export interface AICallContent {
  request: { messages?: AICallMessage[] }
  choices: AICallChoice[]
}

export interface AICallDetail extends AICall {
  contentState: AICallContentState
  content?: AICallContent
  subjects: string[]
  events: AICallEvent[]
}
