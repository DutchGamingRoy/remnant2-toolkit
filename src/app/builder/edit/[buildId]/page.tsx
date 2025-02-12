'use client'

import { useSession } from 'next-auth/react'
import { useRef, useState } from 'react'

import { BuilderPage } from '@/features/build/components/builder/BuilderPage'
import { ActionButton } from '@/features/build/components/buttons/ActionButton'
import { SaveBuildButton } from '@/features/build/components/buttons/SaveBuildButton'
import { ArmorSuggestionsDialog } from '@/features/build/components/dialogs/ArmorSuggestionsDialog'
import { DetailedBuildDialog } from '@/features/build/components/dialogs/DetailedBuildDialog'
import { ImageDownloadInfo } from '@/features/build/components/dialogs/ImageDownloadInfo'
import { ItemTagSuggestionsDialog } from '@/features/build/components/dialogs/ItemTagSuggestionsDialog'
import { useBuildActions } from '@/features/build/hooks/useBuildActions'
import { useDBBuildState } from '@/features/build/hooks/useDBBuildState'
import { dbBuildToBuildState } from '@/features/build/lib/dbBuildToBuildState'
import { BuildState, DBBuild } from '@/features/build/types'
import { PageHeader } from '@/features/ui/PageHeader'

export default function Page({
  params: { INITIAL_BUILD_STATE },
}: {
  params: { INITIAL_BUILD_STATE: DBBuild }
}) {
  const { data: session } = useSession()

  const [detailedBuildDialogOpen, setDetailedBuildDialogOpen] = useState(false)

  const { dbBuildState, updateDBBuildState, setNewBuildState } =
    useDBBuildState(dbBuildToBuildState(INITIAL_BUILD_STATE))

  const {
    isScreenshotMode,
    showControls,
    imageDownloadInfo,
    handleClearImageDownloadInfo,
    handleDeleteBuild,
  } = useBuildActions()

  const buildContainerRef = useRef<HTMLDivElement>(null)

  const [showArmorCalculator, setShowArmorCalculator] = useState(false)
  const [showItemTagSuggestions, setShowItemTagSuggestions] = useState(false)

  function handleSelectArmorSuggestion(newBuildState: BuildState) {
    setNewBuildState(newBuildState)
    setShowArmorCalculator(false)
    setShowItemTagSuggestions(false)
  }

  return (
    <div className="flex w-full flex-col items-center">
      <DetailedBuildDialog
        buildState={dbBuildState}
        open={detailedBuildDialogOpen}
        onClose={() => setDetailedBuildDialogOpen(false)}
      />

      <ImageDownloadInfo
        onClose={handleClearImageDownloadInfo}
        imageDownloadInfo={imageDownloadInfo}
      />

      <PageHeader
        title="Remnant 2 Build Tool"
        subtitle="Edit your builds and share them with your friends and the community."
      >
        &nbsp;
      </PageHeader>

      <ArmorSuggestionsDialog
        buildState={dbBuildState}
        open={showArmorCalculator}
        onClose={() => setShowArmorCalculator(false)}
        onApplySuggestions={handleSelectArmorSuggestion}
      />

      <ItemTagSuggestionsDialog
        buildState={dbBuildState}
        open={showItemTagSuggestions}
        onClose={() => setShowItemTagSuggestions(false)}
        onApplySuggestions={handleSelectArmorSuggestion}
      />

      <BuilderPage
        buildContainerRef={buildContainerRef}
        buildState={dbBuildState}
        isEditable={true}
        isScreenshotMode={isScreenshotMode}
        showControls={showControls}
        onUpdateBuildState={updateDBBuildState}
        builderActions={
          <>
            <SaveBuildButton buildState={dbBuildState} editMode={true} />

            <ActionButton.ArmorCalculator
              onClick={() => setShowArmorCalculator(true)}
            />

            <ActionButton.ItemSuggestions
              onClick={() => setShowItemTagSuggestions(true)}
            />

            <hr className="my-2 w-full border-t-2 border-gray-500/50" />

            <ActionButton.ShowDetailedView
              onClick={() => setDetailedBuildDialogOpen(true)}
            />

            {session && session.user?.id === dbBuildState.createdById && (
              <ActionButton.DeleteBuild
                onClick={() => handleDeleteBuild(dbBuildState.buildId)}
              />
            )}
          </>
        }
      />
    </div>
  )
}
