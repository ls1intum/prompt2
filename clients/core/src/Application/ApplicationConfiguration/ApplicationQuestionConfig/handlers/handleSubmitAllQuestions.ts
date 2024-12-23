import { ApplicationForm, UpdateApplicationForm } from '@/interfaces/application_form'
import { ApplicationQuestionCardRef } from '../components/ApplicationQuestionCard'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'

interface handleSubmitAllQuestionsProps {
  questionRefs: React.MutableRefObject<(ApplicationQuestionCardRef | null | undefined)[]>
  fetchedForm: ApplicationForm
  applicationQuestions: (ApplicationQuestionMultiSelect | ApplicationQuestionText)[]
  setSubmitAttempted: (state: boolean) => void
  mutateApplicationForm: (updateForm: UpdateApplicationForm) => void
}

export const handleSubmitAllQuestions = async ({
  questionRefs,
  fetchedForm,
  applicationQuestions,
  setSubmitAttempted,
  mutateApplicationForm,
}: handleSubmitAllQuestionsProps) => {
  let allValid = true

  // Loop over each child's ref, call validate()
  for (const ref of questionRefs.current) {
    if (!ref) continue
    const isValid = await ref.validate()
    if (!isValid) {
      allValid = false
    }
  }
  setSubmitAttempted(true)
  if (allValid) {
    const deletedTextQuestion = fetchedForm?.questions_text
      .filter((q) => !applicationQuestions.some((aq) => aq.id === q.id))
      .map((q) => q.id)

    const deletedMultiSelectQuestion = fetchedForm?.questions_multi_select
      .filter((q) => !applicationQuestions.some((aq) => aq.id === q.id))
      .map((q) => q.id)

    const questions_multi_select = applicationQuestions
      .filter((q) => 'options' in q)
      .map((q) => q as ApplicationQuestionMultiSelect)

    const questions_text = applicationQuestions
      .filter((q) => !('options' in q))
      .map((q) => q as ApplicationQuestionText)

    const updateForm: UpdateApplicationForm = {
      delete_questions_text: deletedTextQuestion ?? [],
      delete_questions_multi_select: deletedMultiSelectQuestion ?? [],
      create_questions_text: questions_text.filter((q) =>
        q.id.startsWith('not-valid-id-question-'),
      ),
      create_questions_multi_select: questions_multi_select.filter((q) =>
        q.id.startsWith('not-valid-id-question-'),
      ),
      update_questions_text: questions_text.filter(
        (q) => !q.id.startsWith('not-valid-id-question-'),
      ),
      update_questions_multi_select: questions_multi_select.filter(
        (q) => !q.id.startsWith('not-valid-id-question-'),
      ),
    }
    mutateApplicationForm(updateForm)
    console.log(true)
  } else {
    throw new Error('Not all questions are valid')
  }
}
