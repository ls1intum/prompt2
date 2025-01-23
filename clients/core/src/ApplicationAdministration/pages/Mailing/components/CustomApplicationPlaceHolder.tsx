import { AvailableMailPlaceholders } from '@/components/pages/Mailing/components/AvailableMailPlaceholders'

export const CustomApplicationPlaceHolder = () => {
  const additionalPlacerholders = [
    {
      placeholder: '{{applicationEndDate}}',
      description:
        'The end date of the the application phase. (Not available for acceptance/rejection mails). ',
    },
    {
      placeholder: 'https://{{applicationURL}}',
      description:
        'The direct link to the application form. (Not available for acceptance/rejection mails).',
    },
  ]

  return <AvailableMailPlaceholders customAdditionalPlaceholders={additionalPlacerholders} />
}
