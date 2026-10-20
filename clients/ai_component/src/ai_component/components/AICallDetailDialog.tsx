import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ErrorPage,
  LoadingPage,
} from '@tumaet/prompt-ui-components'
import { type AICallChoice, AICallContentState } from '../interfaces/aiCallDetail'
import { getAICall } from '../network/queries/getAICall'
import { messageText } from '../utils/messageText'

interface AICallDetailDialogProps {
  phaseId: string
  callId?: string
  onClose: () => void
}

const CONTENT_NOTICE: Record<AICallContentState, string> = {
  [AICallContentState.AVAILABLE]: '',
  [AICallContentState.RESTRICTED]:
    'The content is restricted after an erasure request and stays hidden until it is purged.',
  [AICallContentState.UNAVAILABLE]:
    'No content is stored: it was purged after its retention, or the call was denied.',
}

const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='text-sm break-all'>{value ?? '-'}</dd>
  </div>
)

const ChoiceView = ({ choice, label }: { choice: AICallChoice; label?: string }) => (
  <div className='rounded-md border border-primary/40 p-3 space-y-2'>
    <div className='flex items-center gap-2'>
      <Badge variant='outline'>AI-generated</Badge>
      {label && <span className='text-xs text-muted-foreground'>{label}</span>}
    </div>
    <p className='text-sm whitespace-pre-wrap'>{choice.content || '-'}</p>
    {choice.refusal && (
      <p className='text-sm whitespace-pre-wrap'>
        <span className='font-medium'>Refusal: </span>
        {choice.refusal}
      </p>
    )}
    {choice.toolCalls?.map((toolCall) => (
      <div key={toolCall.id}>
        <p className='text-xs font-medium'>Tool call: {toolCall.name}</p>
        <pre className='text-xs font-mono whitespace-pre-wrap break-all'>{toolCall.arguments}</pre>
      </div>
    ))}
  </div>
)

export const AICallDetailDialog = ({ phaseId, callId, onClose }: AICallDetailDialogProps) => {
  // Every fetch is recorded as a content view, so nothing may refetch on its own.
  const {
    data: call,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['aiCall', phaseId, callId],
    queryFn: () => getAICall(phaseId, callId ?? ''),
    enabled: callId !== undefined,
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return (
    <Dialog open={callId !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>AI call</DialogTitle>
          <DialogDescription>Opening a call is recorded in its audit trail.</DialogDescription>
        </DialogHeader>

        {isError ? (
          <ErrorPage message='Failed to load the AI call.' />
        ) : isPending ? (
          <LoadingPage />
        ) : (
          <div className='space-y-6'>
            <dl className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              <Field label='Time' value={new Date(call.requestedAt).toLocaleString()} />
              <Field
                label='Outcome'
                value={call.errorCode ? `${call.outcome} (${call.errorCode})` : call.outcome}
              />
              <Field label='Feature' value={call.feature} />
              <Field
                label='Template'
                value={call.template && `${call.template} v${call.templateVersion ?? '-'}`}
              />
              <Field label='Model' value={call.servedModel ?? call.requestedModel} />
              <Field label='Model build' value={call.systemFingerprint} />
              <Field label='Finish reason' value={call.finishReason} />
              <Field label='Actor' value={`${call.actorId} (${call.actorRole})`} />
              <Field label='Service' value={call.callerService || null} />
              <Field label='Issuer' value={call.issuer} />
              <Field
                label='Tokens'
                value={
                  call.promptTokens !== null
                    ? `${call.promptTokens} / ${call.completionTokens}`
                    : null
                }
              />
              <Field label='Subjects' value={call.subjects.length} />
            </dl>

            {call.content ? (
              <div className='space-y-3'>
                {(call.content.request.messages ?? []).map((message, index) => (
                  <div key={index} className='rounded-md border p-3'>
                    <p className='text-xs font-medium uppercase text-muted-foreground'>
                      {message.role}
                    </p>
                    <p className='text-sm whitespace-pre-wrap'>{messageText(message.content)}</p>
                  </div>
                ))}
                {call.content.choices.length === 0 ? (
                  <ChoiceView choice={{ index: 0, content: '' }} />
                ) : (
                  call.content.choices.map((choice, _, choices) => (
                    <ChoiceView
                      key={choice.index}
                      choice={choice}
                      label={choices.length > 1 ? `Choice ${choice.index + 1}` : undefined}
                    />
                  ))
                )}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>{CONTENT_NOTICE[call.contentState]}</p>
            )}

            <div>
              <h4 className='text-sm font-medium'>Events</h4>
              <ul className='mt-2 space-y-1 text-sm'>
                {call.events.map((event) => (
                  <li key={event.id}>
                    {new Date(event.createdAt).toLocaleString()}: {event.type} by {event.actorId}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
