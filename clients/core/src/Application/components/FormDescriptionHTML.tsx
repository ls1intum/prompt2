import { FormDescription } from '@/components/ui/form'
import DOMPurify from 'dompurify'

interface FormDescriptionHTMLProps {
  htmlCode: string
}

export const FormDescriptionHTML = ({ htmlCode }: FormDescriptionHTMLProps): JSX.Element => {
  const sanitizedHtmlCode = DOMPurify.sanitize(htmlCode)

  return (
    <FormDescription>
      <style>
        {`
            a {
                cursor: pointer;
                color: #1d4ed8; /* Equivalent to text-blue-700 */
                text-decoration: underline; /* Always underlined */
            }
            a:hover {
                text-decoration: underline; /* Ensure underline on hover */
            }
    `}
      </style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlCode }} />
    </FormDescription>
  )
}
