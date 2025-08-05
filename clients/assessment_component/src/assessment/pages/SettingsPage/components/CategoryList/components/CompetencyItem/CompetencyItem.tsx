import { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'

import { Button } from '@tumaet/prompt-ui-components'

import { Competency } from '../../../../../../interfaces/competency'

import { useSelfEvaluationCategoryStore } from '../../../../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../../../../zustand/usePeerEvaluationCategoryStore'

import { EditCompetencyDialog } from './components/EditCompetencyDialog'
import { DeleteConfirmDialog } from '../DeleteConfirmDialog'
import { useUpdateCompetencyMapping } from '../../hooks/useUpdateCompetencyMapping'
import { EvaluationMapping } from './components/EvaluationMapping'

interface CompetencyItemProps {
  competency: Competency
  categoryID: string
}

export const CompetencyItem = ({ competency, categoryID }: CompetencyItemProps) => {
  const [competencyToEdit, setCompetencyToEdit] = useState<Competency | undefined>(undefined)
  const [competencyToDelete, setCompetencyToDelete] = useState<
    | {
        id: string
        categoryID: string
      }
    | undefined
  >(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const { allSelfEvaluationCompetencies } = useSelfEvaluationCategoryStore()
  const { allPeerEvaluationCompetencies } = usePeerEvaluationCategoryStore()
  const updateMappingMutation = useUpdateCompetencyMapping(setError)

  // Get currently mapped self and peer evaluation competencies
  const currentSelfMapping = competency.mappedFromCompetencies.find((id) =>
    allSelfEvaluationCompetencies.some((comp) => comp.id === id),
  )
  const currentPeerMapping = competency.mappedFromCompetencies.find((id) =>
    allPeerEvaluationCompetencies.some((comp) => comp.id === id),
  )

  const handleSelfEvaluationMapping = (competencyId: string) => {
    if (competencyId === 'none') {
      // Remove mapping if "No mapping" is selected
      if (currentSelfMapping) {
        updateMappingMutation.mutate({
          competency,
          newMappedCompetencyId: currentSelfMapping,
          action: 'remove',
          evaluationType: 'self',
        })
      }
    } else {
      updateMappingMutation.mutate({
        competency,
        newMappedCompetencyId: competencyId,
        action: 'update',
        evaluationType: 'self',
        currentMapping: currentSelfMapping,
      })
    }
  }

  const handlePeerEvaluationMapping = (competencyId: string) => {
    if (competencyId === 'none') {
      // Remove mapping if "No mapping" is selected
      if (currentPeerMapping) {
        updateMappingMutation.mutate({
          competency,
          newMappedCompetencyId: currentPeerMapping,
          action: 'remove',
          evaluationType: 'peer',
        })
      }
    } else {
      updateMappingMutation.mutate({
        competency,
        newMappedCompetencyId: competencyId,
        action: 'update',
        evaluationType: 'peer',
        currentMapping: currentPeerMapping,
      })
    }
  }

  const handleRemoveSelfMapping = () => {
    if (currentSelfMapping) {
      updateMappingMutation.mutate({
        competency,
        newMappedCompetencyId: currentSelfMapping,
        action: 'remove',
        evaluationType: 'self',
      })
    }
  }

  const handleRemovePeerMapping = () => {
    if (currentPeerMapping) {
      updateMappingMutation.mutate({
        competency,
        newMappedCompetencyId: currentPeerMapping,
        action: 'remove',
        evaluationType: 'peer',
      })
    }
  }

  return (
    <div>
      <div className='rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md relative'>
        <div className='absolute top-2 right-2 flex gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setCompetencyToEdit(competency)}
            aria-label={`Edit ${competency.name}`}
          >
            <Edit className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setCompetencyToDelete({ id: competency.id, categoryID: categoryID })}
            aria-label={`Delete ${competency.name}`}
          >
            <Trash2 className='h-3.5 w-3.5 text-destructive' />
          </Button>
        </div>
        <div className='mb-3'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-sm font-medium'>{competency.name}</span>
          </div>
          <div className='mb-3 space-y-3'>
            {/* Self Evaluation Mapping */}
            <EvaluationMapping
              label='Self Evaluation Competency'
              placeholder='Select self evaluation competency...'
              competencies={allSelfEvaluationCompetencies}
              currentMapping={currentSelfMapping}
              onMappingChange={handleSelfEvaluationMapping}
              onRemoveMapping={handleRemoveSelfMapping}
            />

            {/* Peer Evaluation Mapping */}
            <EvaluationMapping
              label='Peer Evaluation Competency'
              placeholder='Select peer evaluation competency...'
              competencies={allPeerEvaluationCompetencies}
              currentMapping={currentPeerMapping}
              onMappingChange={handlePeerEvaluationMapping}
              onRemoveMapping={handleRemovePeerMapping}
            />

            {error && <div className='text-xs text-destructive mt-1'>{error}</div>}
          </div>
        </div>
        <div className='text-sm text-muted-foreground mb-3'>{competency.description}</div>
        <div className='text-xs grid grid-cols-5 gap-x-2'>
          <div className='space-y-1'>
            <div className='font-semibold'>Very Bad</div>
            <div>{competency.descriptionVeryBad}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Bad</div>
            <div>{competency.descriptionBad}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>OK</div>
            <div>{competency.descriptionOk}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Good</div>
            <div>{competency.descriptionGood}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Very Good</div>
            <div>{competency.descriptionVeryGood}</div>
          </div>
        </div>
      </div>

      <EditCompetencyDialog
        open={!!competencyToEdit}
        onOpenChange={(open) => !open && setCompetencyToEdit(undefined)}
        competency={competencyToEdit}
      />

      {competencyToDelete && (
        <DeleteConfirmDialog
          open={!!competencyToDelete}
          onOpenChange={(open) => !open && setCompetencyToDelete(undefined)}
          title='Delete Competency'
          description='Are you sure you want to delete this competency? This action cannot be undone.'
          itemType='competency'
          itemId={competencyToDelete.id}
          categoryId={competencyToDelete.categoryID}
        />
      )}
    </div>
  )
}
