import { create } from 'zustand'
import { Evaluation } from '../interfaces/evaluation'
import { EvaluationCompletion } from '../interfaces/evaluationCompletion'

export interface EvaluationStore {
  selfEvaluations: Evaluation[]
  setSelfEvaluations: (evaluations: Evaluation[]) => void
  peerEvaluations: Evaluation[]
  setPeerEvaluations: (evaluations: Evaluation[]) => void
  selfEvaluationCompletion: EvaluationCompletion | undefined
  peerEvaluationCompletions: EvaluationCompletion[]
  setSelfEvaluationCompletion: (completion: EvaluationCompletion | undefined) => void
  setPeerEvaluationCompletions: (completions: EvaluationCompletion[]) => void
}

export const useEvaluationStore = create<EvaluationStore>((set) => ({
  selfEvaluations: [],
  setSelfEvaluations: (evaluations) => set({ selfEvaluations: evaluations }),
  peerEvaluations: [],
  setPeerEvaluations: (evaluations) => set({ peerEvaluations: evaluations }),
  selfEvaluationCompletion: undefined,
  peerEvaluationCompletions: [],
  setSelfEvaluationCompletion: (completion) => set({ selfEvaluationCompletion: completion }),
  setPeerEvaluationCompletions: (completions) => set({ peerEvaluationCompletions: completions }),
}))
