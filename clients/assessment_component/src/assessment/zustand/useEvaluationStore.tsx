import { create } from 'zustand'
import { EvaluationCompletion } from '../interfaces/evaluationCompletion'

export interface EvaluationStore {
  selfEvaluationCompletion: EvaluationCompletion | undefined
  peerEvaluationCompletions: EvaluationCompletion[]
  setSelfEvaluationCompletion: (completion: EvaluationCompletion | undefined) => void
  setPeerEvaluationCompletions: (completions: EvaluationCompletion[]) => void
}

export const useEvaluationStore = create<EvaluationStore>((set) => ({
  selfEvaluationCompletion: undefined,
  peerEvaluationCompletions: [],
  setSelfEvaluationCompletion: (completion) => set({ selfEvaluationCompletion: completion }),
  setPeerEvaluationCompletions: (completions) => set({ peerEvaluationCompletions: completions }),
}))
