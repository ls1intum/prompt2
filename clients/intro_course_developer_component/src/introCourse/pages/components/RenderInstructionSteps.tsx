export interface InstructionStep {
  title: string
  description?: JSX.Element | string
  substeps?: InstructionStep[]
}

export const RenderInstructionSteps = ({
  steps,
  isNested = false,
}: {
  steps: InstructionStep[]
  isNested?: boolean
}) => {
  return (
    <ol className={`${isNested ? 'list-decimal ml-6 pl-6 mt-2 space-y-2' : 'pl-2 space-y-4'}`}>
      {steps.map((step, index) => (
        <li key={index} className='pb-4'>
          <div className={`${isNested ? '' : 'font-semibold'} text-primary`}>{step.title}</div>
          {step.description && (
            <p className='mt-1 text-sm text-muted-foreground'>{step.description}</p>
          )}
          {step.substeps && <RenderInstructionSteps steps={step.substeps} isNested />}
        </li>
      ))}
    </ol>
  )
}
