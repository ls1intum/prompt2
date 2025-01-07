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

          ol {
              list-style: decimal; /* Restore list-style for ordered lists */
              margin: 0 0 1rem 1.5rem; /* Adjust spacing around lists */
              padding: 0;
          }

          ol ol {
              list-style: lower-alpha; /* Nested ordered list with lower-alpha style */
              margin: 0.25rem 0 0.25rem 1rem; /* Adjust nested list margin */
          }

          ol ol ol {
              list-style: lower-roman; /* Nested nested ordered list with lower-roman style */
              margin: 0.25rem 0 0.25rem 1rem;
          }

          ul {
              list-style: disc; /* Restore list-style for unordered lists */
              margin: 0 0 1rem 1.5rem; /* Adjust spacing around lists */
              padding: 0;
          }

          ul ul {
              list-style: circle; /* Nested unordered list with circle style */
              margin: 0.25rem 0 0.25rem 1rem;
          }

          ul ul ul {
              list-style: square; /* Nested nested unordered list with square style */
              margin: 0.25rem 0 0.25rem 1rem;
          }

          li {
              margin: 0.25rem 0; /* Reduced spacing between list items */
          }

          li p.text-node {
              margin: 0; /* Remove extra margin from text nodes inside list items */
          }

          p.text-node {
              margin: 0 0 1rem; /* Add smaller spacing between paragraphs */
          }
        `}
      </style>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlCode }} />
    </FormDescription>
  )
}
