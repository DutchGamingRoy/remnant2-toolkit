import { StarIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Fragment, useCallback, useMemo, useState } from 'react'

import { PopularBuildBadge } from '@/features/build/components/build-card/PopularBuildBadge'
import { BuildState, ItemCategory } from '@/features/build/types'
import { ItemInfoDialog } from '@/features/items/components/ItemInfoDialog'
import { Archetype, Item } from '@/features/items/types'
import { TraitItem } from '@/features/items/types/TraitItem'
import { Logo } from '@/features/ui/Logo'
import { cn } from '@/lib/classnames'

import { ItemButton } from '../../../items/components/ItemButton'
import { DEFAULT_TRAIT_AMOUNT, POPULAR_VOTE_THRESHOLD } from '../../constants'
import { formatUpdatedAt } from '../../lib/formatUpdatedAt'
import { getArchetypeBuildName } from '../../lib/getArchetypeBuildName'
import { getArrayOfLength } from '../../lib/getArrayOfLength'
import { getConcoctionSlotCount } from '../../lib/getConcoctionSlotCount'
import { getItemListForSlot } from '../../lib/getItemListForSlot'
import { isBuildNew } from '../../lib/isBuildNew'
import { FeaturedBuildBadge } from '../build-card/FeaturedBuildBadge'
import { NewBuildBadge } from '../build-card/NewBuildBadge'
import { ItemSelect } from '../dialogs/ItemSelect'
import { BuilderName } from './BuilderName'
import { MemberFeatures } from './MemberFeatures'
import { Stats } from './stats/Stats'
import { Traits } from './Traits'

type BuilderProps = {
  buildState: BuildState
  isScreenshotMode: boolean
  showControls: boolean
  showCreatedBy?: boolean
  totalUpvotes?: number
} & (
  | { isEditable: false; onUpdateBuildState?: never }
  | {
      isEditable: true
      onUpdateBuildState: ({
        category,
        value,
        scroll,
      }: {
        category: string
        value: string | Array<string | undefined>
        scroll?: boolean
      }) => void
    }
)

export function Builder({
  buildState,
  isEditable,
  isScreenshotMode,
  showControls,
  showCreatedBy = true,
  onUpdateBuildState,
}: BuilderProps) {
  const concoctionSlotCount = getConcoctionSlotCount(buildState)
  const isPopular = buildState.totalUpvotes >= POPULAR_VOTE_THRESHOLD
  const isNew = isBuildNew(buildState.createdAt) && showCreatedBy

  // Tracks information about the slot the user is selecting an item for
  const [selectedItemSlot, setSelectedItemSlot] = useState<{
    category: ItemCategory | null
    index?: number
  }>({
    category: null,
  })

  /** If the item category is null, modal is closed */
  const isItemSelectModalOpen = Boolean(selectedItemSlot.category)

  //Tracks whether the build name is editable or not.
  const [isEditingBuildName, setIsEditingBuildName] = useState(false)

  // Tracks the item that the user is viewing information for
  const [infoItem, setInfoItem] = useState<Item | null>(null)

  /**
   * Returns a list of items that match the selected slot
   * This is passed to the ItemSelect modal to display the correct items
   */
  const itemListForSlot = useMemo(
    () => getItemListForSlot(buildState, selectedItemSlot),
    [selectedItemSlot, buildState],
  )

  /**
   * Fires when the user changes an item in the build.
   *
   * If the item is null, the item is removed from the build
   * and from the query string.
   *
   * If the item is not null, the item is added to the build
   * and the query string is updated.
   */
  const handleSelectItem = useCallback(
    (selectedItem: Item | null) => {
      if (!selectedItemSlot.category) return
      if (!onUpdateBuildState) return

      /**
       * The item index is used to determine which item in the array of items
       * for slots like rings and archetypes
       */
      const specifiedIndex = selectedItemSlot.index
      const isIndexSpecified = specifiedIndex !== undefined

      // If the item is null, remove the item from the build
      // and from the query string
      // If the item can be multiple, such as rings,
      // then remove the item at the specified index
      if (!selectedItem) {
        if (isIndexSpecified) {
          const buildItems = buildState.items[selectedItemSlot.category]

          if (!Array.isArray(buildItems)) return

          // We can't filter here because we want to preserve the index
          // If we filtered, the second archetype would become the first archetype
          // if you removed the first archetype
          const newBuildItems = buildItems.map((item, index) =>
            index === specifiedIndex ? null : item,
          )
          const newItemIds = newBuildItems.map((i) => i?.id ?? '')
          onUpdateBuildState({
            category: selectedItemSlot.category,
            value: newItemIds,
          })
        } else {
          onUpdateBuildState({ category: selectedItemSlot.category, value: '' })
        }

        setSelectedItemSlot({ category: null })
        return
      }

      const categoryItemOrItems = buildState.items[selectedItemSlot.category]

      // If the item can be multiple, such as rings,
      // then add the item at the specified index
      if (Array.isArray(categoryItemOrItems)) {
        const buildItems = categoryItemOrItems

        const itemAlreadyInBuild = buildItems.find(
          (i) => i?.id === selectedItem.id,
        )
        if (itemAlreadyInBuild) return

        /** Used to add the new item to the array of items for this slot */
        const newBuildItems = [...buildItems]

        const specifiedIndex = selectedItemSlot.index
        const isIndexSpecified = specifiedIndex !== undefined

        isIndexSpecified
          ? (newBuildItems[specifiedIndex] = selectedItem)
          : newBuildItems.push(selectedItem)

        // If the item is a trait, then we need to add the amount
        if (selectedItemSlot.category === 'trait') {
          const newTraitItemParams = TraitItem.toParams(
            newBuildItems as TraitItem[],
          )

          onUpdateBuildState({ category: 'trait', value: newTraitItemParams })
          setSelectedItemSlot({ category: null })
          return
        }

        // If we got here, add the item to the build
        const newItemIds = newBuildItems.map((i) => i?.id)
        onUpdateBuildState({
          category: selectedItem.category,
          value: newItemIds,
        })
        setSelectedItemSlot({ category: null })
        return
      }

      // If the item is not null, add the item to the build
      const buildItem = categoryItemOrItems

      const itemAlreadyInBuild = buildItem?.id === selectedItem.id
      if (itemAlreadyInBuild) return

      onUpdateBuildState({
        category: selectedItem.category,
        value: selectedItem.id,
      })
      setSelectedItemSlot({ category: null })
    },
    [
      buildState.items,
      selectedItemSlot.category,
      selectedItemSlot.index,
      onUpdateBuildState,
    ],
  )

  function handleChangeBuildLink(newBuildLink: string) {
    if (!isEditable) return
    if (!onUpdateBuildState) return
    onUpdateBuildState({ category: 'buildLink', value: newBuildLink })
  }

  function handleChangeDescription(description: string) {
    if (!isEditable) return
    if (!onUpdateBuildState) return
    onUpdateBuildState({ category: 'description', value: description })
  }

  function handleToggleIsPublic(isPublic: boolean) {
    if (!isEditable) return
    if (!onUpdateBuildState) return
    onUpdateBuildState({
      category: 'isPublic',
      value: isPublic ? 'true' : 'false',
    })
  }

  function handleShowInfo(item: Item) {
    setInfoItem(item)
  }

  function handleItemSlotClick(category: ItemCategory, index?: number) {
    if (!isEditable) return
    setSelectedItemSlot({ category, index })
  }

  function handleUpdateBuildName(newBuildName: string) {
    if (!isEditable) return
    if (!onUpdateBuildState) return
    onUpdateBuildState({ category: 'name', value: newBuildName })
    setIsEditingBuildName(false)
  }

  function handleRemoveTrait(traitItem: TraitItem) {
    if (!isEditable) return
    if (!onUpdateBuildState) return

    const newTraitItems = buildState.items.trait.filter(
      (i) => i.name !== traitItem.name,
    )
    const newTraitItemParams = TraitItem.toParams(newTraitItems)
    onUpdateBuildState({ category: 'trait', value: newTraitItemParams })
  }

  function handleUpdateTraitAmount(newTraitItem: TraitItem) {
    if (!isEditable) return
    if (!onUpdateBuildState) return

    const newTraitItems = buildState.items.trait.map((traitItem) => {
      if (traitItem.name === newTraitItem.name) {
        return newTraitItem
      }
      return traitItem
    })

    // validate the amounts
    const validatedTraitItems = newTraitItems.map((traitItem) => {
      let validAmount = traitItem.amount

      // if this is the linked trait to an archetype,
      // the default should be the linked amount
      let defaultAmount = DEFAULT_TRAIT_AMOUNT

      // if this is the linked trait for the primary archetype,
      // make sure the amount is not less than the minimum allowed
      if (buildState.items.archetype[0]?.name) {
        const linkedTrait =
          buildState.items.archetype[0]?.linkedItems?.traits?.find(
            (linkedTrait) => linkedTrait.name === traitItem.name,
          )
        if (linkedTrait && traitItem.name === linkedTrait.name) {
          if (validAmount < linkedTrait.amount) {
            validAmount = linkedTrait.amount
            defaultAmount = linkedTrait.amount
          }
        }
      }
      // if this is the linked trait for the secondary archetype
      // make sure the amount is not less than the minimum allowed
      if (buildState.items.archetype[1]?.name) {
        const linkedTrait =
          buildState.items.archetype[1]?.linkedItems?.traits?.find(
            (linkedTrait) =>
              linkedTrait.name === traitItem.name && linkedTrait.amount === 10,
          )
        if (linkedTrait && traitItem.name === linkedTrait.name) {
          if (validAmount < linkedTrait.amount) {
            validAmount = linkedTrait.amount
            defaultAmount = linkedTrait.amount
          }
        }
      }

      if (isNaN(validAmount)) validAmount = defaultAmount
      if (validAmount < 1) validAmount = defaultAmount
      if (validAmount > 10) validAmount = defaultAmount

      return { ...traitItem, amount: validAmount }
    })

    const newTraitItemParams = TraitItem.toParams(validatedTraitItems)
    onUpdateBuildState({ category: 'trait', value: newTraitItemParams })
  }

  return (
    <>
      <ItemSelect
        key={selectedItemSlot.category}
        open={isItemSelectModalOpen}
        onClose={() => setSelectedItemSlot({ category: null })}
        onSelectItem={handleSelectItem}
        itemList={itemListForSlot}
        buildSlot={selectedItemSlot.category}
      />

      <ItemInfoDialog
        item={infoItem}
        open={Boolean(infoItem)}
        onClose={() => setInfoItem(null)}
      />

      {buildState.isPublic === false && !isScreenshotMode && (
        <div className="text-md mb-4 flex flex-col items-center justify-center gap-4 border-2 border-red-500 p-4 font-semibold text-red-500">
          This build is currently marked private. Other users will be unable to
          view it until you mark it public.
        </div>
      )}
      <div
        id="build-container"
        className={cn(
          'relative w-full grow rounded border-2 bg-black p-4',
          !buildState.isMember && 'border-primary-500',
          buildState.isMember &&
            !isScreenshotMode &&
            'border-accent1-300 shadow-accent1-600 shadow-lg',
          buildState.isMember && isScreenshotMode && 'border-primary-500',
          isScreenshotMode && 'pb-[70px]',
        )}
      >
        <div
          id="build-header"
          className={cn(
            'border-b-primary-900 relative mb-4 border-b',
            (isPopular || isNew || buildState.isFeaturedBuild) && 'mb-10 pb-6',
          )}
        >
          <BuilderName
            isEditable={isEditable}
            isEditingBuildName={isEditingBuildName}
            isScreenshotMode={isScreenshotMode}
            onClick={() => setIsEditingBuildName(true)}
            onClose={(newBuildName: string) =>
              handleUpdateBuildName(newBuildName)
            }
            name={buildState.name}
            showControls={showControls}
          />
          {showCreatedBy && (
            <div className="mb-2 flex items-center justify-center text-sm text-gray-400">
              <span>
                {`${getArchetypeBuildName({
                  archetype1:
                    (buildState.items.archetype[0]?.name.toLowerCase() as Archetype) ||
                    null,
                  archetype2:
                    (buildState.items.archetype[1]?.name.toLowerCase() as Archetype) ||
                    null,
                })}`}{' '}
                Build by{' '}
              </span>
              <Link
                href={`/profile/${buildState.createdById}`}
                className="text-primary-500 ml-1 underline"
              >
                {buildState.createdByDisplayName}
              </Link>
              <div className="ml-2 flex flex-row text-sm">
                <StarIcon
                  className={cn(
                    'text-accent1-500 mr-0.5 h-4 w-4',
                    isScreenshotMode ? 'mt-[1.5px]' : 'mt-0.5',
                  )}
                />
                <span
                  className={cn(
                    'text-white',
                    isScreenshotMode ? 'mb-[2px]' : 'mb-0.5',
                  )}
                >
                  {buildState.totalUpvotes}
                </span>
              </div>
            </div>
          )}
          {buildState.buildLink && (
            <div className="mb-2 flex w-full items-center justify-center text-sm text-gray-300">
              <span className="overflow-y-auto whitespace-pre-wrap text-center">
                {buildState.buildLink}
              </span>
            </div>
          )}
          {buildState.updatedAt && (
            <div className="mb-2 flex items-center justify-center text-sm text-gray-400">
              <p className="text-left text-xs text-gray-400">
                Last Updated:{' '}
                <span className="text-gray-300">
                  {formatUpdatedAt(buildState.updatedAt)}
                </span>
              </p>
            </div>
          )}
          {buildState.isPatchAffected && (
            <div className="mb-2 flex items-center justify-center text-sm text-gray-400">
              <p className="border border-red-500 p-2 text-left text-xs font-bold text-red-500">
                This build might have been affected by a past update. If you
                created this build, please update and save it to remove this
                banner.
              </p>
            </div>
          )}
          {(isPopular || isNew || buildState.isFeaturedBuild) && (
            <div className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 translate-y-1/2 transform items-center justify-center gap-x-2">
              {isNew ? <NewBuildBadge unoptimized={isScreenshotMode} /> : null}
              {isPopular ? (
                <PopularBuildBadge unoptimized={isScreenshotMode} />
              ) : null}
              {buildState.isFeaturedBuild ? (
                <FeaturedBuildBadge unoptimized={isScreenshotMode} />
              ) : null}
            </div>
          )}
        </div>

        <div
          id="build-wrapper"
          className={cn(
            'flex w-full flex-col items-start justify-between md:flex-row md:gap-x-8',
            isScreenshotMode && 'flex-row gap-x-8',
          )}
        >
          <div
            id="build-left-column"
            className="flex w-full max-w-[475px] flex-col"
          >
            <div
              id="archetype-container"
              className={cn(
                'flex flex-row flex-wrap items-start justify-between gap-1 sm:justify-center',
                isScreenshotMode && 'justify-center gap-2',
              )}
            >
              {getArrayOfLength(2).map((archetypeIndex) => (
                <Fragment key={`archetype-${archetypeIndex}`}>
                  <ItemButton
                    item={buildState.items.archetype[archetypeIndex]}
                    isEditable={isEditable}
                    onClick={() =>
                      handleItemSlotClick('archetype', archetypeIndex)
                    }
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                  <ItemButton
                    item={buildState.items.skill[archetypeIndex]}
                    isEditable={isEditable}
                    onClick={() => handleItemSlotClick('skill', archetypeIndex)}
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                </Fragment>
              ))}
            </div>
            <div
              id="build-items-container"
              className={cn(
                'relative flex w-full items-start justify-between gap-4',
              )}
            >
              <div
                id="left-column"
                className={cn('flex-none', isScreenshotMode && 'mt-[-75px]')}
              >
                <ItemButton
                  item={buildState.items.helm}
                  isEditable={isEditable}
                  onClick={() => handleItemSlotClick('helm')}
                  onItemInfoClick={handleShowInfo}
                  isScreenshotMode={isScreenshotMode}
                  manualWordBreaks={true}
                  unoptimized={isScreenshotMode}
                />
                <ItemButton
                  item={buildState.items.torso}
                  isEditable={isEditable}
                  onClick={() => handleItemSlotClick('torso')}
                  onItemInfoClick={handleShowInfo}
                  isScreenshotMode={isScreenshotMode}
                  manualWordBreaks={true}
                  unoptimized={isScreenshotMode}
                />
                <ItemButton
                  item={buildState.items.legs}
                  isEditable={isEditable}
                  onClick={() => handleItemSlotClick('legs')}
                  onItemInfoClick={handleShowInfo}
                  isScreenshotMode={isScreenshotMode}
                  manualWordBreaks={true}
                  unoptimized={isScreenshotMode}
                />
                <ItemButton
                  item={buildState.items.gloves}
                  isEditable={isEditable}
                  onClick={() => handleItemSlotClick('gloves')}
                  onItemInfoClick={handleShowInfo}
                  isScreenshotMode={isScreenshotMode}
                  manualWordBreaks={true}
                  unoptimized={isScreenshotMode}
                />
                <div
                  id="relic-container"
                  className="relative flex items-start justify-start"
                >
                  <ItemButton
                    item={buildState.items.relic}
                    isEditable={isEditable}
                    onClick={() => handleItemSlotClick('relic')}
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                  <div
                    id="relic-fragment-container"
                    className="absolute left-[66px] top-0 flex w-[160px] flex-col items-start justify-start"
                  >
                    <ItemButton
                      isEditable={isEditable}
                      size="sm"
                      item={buildState.items.relicfragment[0]}
                      onClick={() => handleItemSlotClick('relicfragment', 0)}
                      onItemInfoClick={handleShowInfo}
                      isScreenshotMode={isScreenshotMode}
                      manualWordBreaks={true}
                      unoptimized={isScreenshotMode}
                    />
                    <ItemButton
                      item={buildState.items.relicfragment[1]}
                      isEditable={isEditable}
                      size="sm"
                      onClick={() => handleItemSlotClick('relicfragment', 1)}
                      onItemInfoClick={handleShowInfo}
                      isScreenshotMode={isScreenshotMode}
                      manualWordBreaks={true}
                      unoptimized={isScreenshotMode}
                    />
                    <ItemButton
                      item={buildState.items.relicfragment[2]}
                      isEditable={isEditable}
                      size="sm"
                      onClick={() => handleItemSlotClick('relicfragment', 2)}
                      onItemInfoClick={handleShowInfo}
                      isScreenshotMode={isScreenshotMode}
                      manualWordBreaks={true}
                      unoptimized={isScreenshotMode}
                    />
                  </div>
                </div>
              </div>
              <div
                id="center-column"
                className="relative ml-[13px] flex h-[450px] max-h-[450px] w-full flex-col items-start justify-start overflow-y-auto sm:h-[460px] sm:max-h-[460px]"
              >
                <Stats
                  buildState={buildState}
                  isScreenshotMode={isScreenshotMode}
                />
              </div>
              <div
                id="right-column"
                className={cn('flex-none', isScreenshotMode && 'mt-[-75px]')}
              >
                <ItemButton
                  item={buildState.items.amulet}
                  isEditable={isEditable}
                  onClick={() => handleItemSlotClick('amulet')}
                  onItemInfoClick={handleShowInfo}
                  isScreenshotMode={isScreenshotMode}
                  manualWordBreaks={true}
                  unoptimized={isScreenshotMode}
                />
                {getArrayOfLength(4).map((ringIndex) => (
                  <ItemButton
                    key={`ring-${ringIndex}`}
                    item={buildState.items.ring[ringIndex]}
                    isEditable={isEditable}
                    onClick={() => handleItemSlotClick('ring', ringIndex)}
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            id="build-right-column"
            className="flex w-full flex-col items-center justify-start"
          >
            <div
              id="guns-row"
              className={cn(
                'mb-4 flex w-full flex-row items-start justify-start gap-2 overflow-x-auto',
              )}
            >
              {getArrayOfLength(3).map((weaponIndex) => (
                <div
                  key={`gun-${weaponIndex}`}
                  className="flex flex-col items-start justify-center"
                >
                  <ItemButton
                    item={buildState.items.weapon[weaponIndex]}
                    size="wide"
                    isEditable={isEditable}
                    onClick={() => handleItemSlotClick('weapon', weaponIndex)}
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                  <div className="flex w-full grow items-start justify-around gap-4">
                    {weaponIndex !== 1 || buildState.items.mod[weaponIndex] ? (
                      <ItemButton
                        item={buildState.items.mod[weaponIndex]}
                        size="md"
                        isEditable={isEditable}
                        onClick={
                          weaponIndex === 1
                            ? undefined
                            : () => handleItemSlotClick('mod', weaponIndex)
                        }
                        onItemInfoClick={handleShowInfo}
                        isScreenshotMode={isScreenshotMode}
                        manualWordBreaks={true}
                        unoptimized={isScreenshotMode}
                      />
                    ) : (
                      <div className="h-[66px] w-[66px]" />
                    )}
                    <ItemButton
                      item={buildState.items.mutator[weaponIndex]}
                      size="md"
                      isEditable={isEditable}
                      onClick={() =>
                        handleItemSlotClick('mutator', weaponIndex)
                      }
                      onItemInfoClick={handleShowInfo}
                      isScreenshotMode={isScreenshotMode}
                      manualWordBreaks={true}
                      unoptimized={isScreenshotMode}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div id="trait-row" className="w-full">
              <Traits
                buildState={buildState}
                showControls={showControls}
                isEditable={isEditable}
                isScreenshotMode={isScreenshotMode}
                onAddTrait={() => handleItemSlotClick('trait')}
                onItemInfoClick={handleShowInfo}
                onRemoveTrait={(traitItem) => handleRemoveTrait(traitItem)}
                onUpdateAmount={(newTraitItem) =>
                  handleUpdateTraitAmount(newTraitItem)
                }
              />
            </div>

            <div id="concoction-consumable-container" className="w-full">
              {buildState.items.concoction.every((i) => !i) &&
              !isEditable ? null : (
                <div
                  id="concoction-container"
                  className={cn(
                    'mt-4 flex w-full flex-row flex-wrap items-start justify-start gap-x-2 gap-y-0 sm:justify-start',
                    isScreenshotMode && 'justify-start',
                  )}
                >
                  <ItemButton
                    item={buildState.items.concoction[0]}
                    isEditable={isEditable}
                    onClick={() => handleItemSlotClick('concoction', 0)}
                    onItemInfoClick={handleShowInfo}
                    isScreenshotMode={isScreenshotMode}
                    manualWordBreaks={true}
                    unoptimized={isScreenshotMode}
                  />
                  {getArrayOfLength(concoctionSlotCount).map((index) => {
                    // Add 1 to the index because we already rendered the first slot
                    const concoctionIndex = index + 1
                    return (
                      <ItemButton
                        key={`concoction-${concoctionIndex}`}
                        item={buildState.items.concoction[concoctionIndex]}
                        isEditable={isEditable}
                        onClick={() =>
                          handleItemSlotClick('concoction', concoctionIndex)
                        }
                        onItemInfoClick={handleShowInfo}
                        isScreenshotMode={isScreenshotMode}
                        manualWordBreaks={true}
                        unoptimized={isScreenshotMode}
                      />
                    )
                  })}
                </div>
              )}

              {buildState.items.consumable.every((i) => !i) &&
              !isEditable ? null : (
                <div
                  id="consumable-container"
                  className={cn(
                    'mt-4 flex w-full flex-row flex-wrap items-start justify-between gap-x-2 gap-y-0 sm:justify-start',
                    isScreenshotMode && 'justify-start',
                  )}
                >
                  {getArrayOfLength(4).map((consumableIndex) => (
                    <ItemButton
                      key={`consumable-${consumableIndex}`}
                      item={buildState.items.consumable[consumableIndex]}
                      isEditable={isEditable}
                      onClick={() =>
                        handleItemSlotClick('consumable', consumableIndex)
                      }
                      onItemInfoClick={handleShowInfo}
                      isScreenshotMode={isScreenshotMode}
                      manualWordBreaks={true}
                      unoptimized={isScreenshotMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          id="member-features-row"
          className="mt-4 flex w-full items-start justify-center"
        >
          <MemberFeatures
            buildLink={buildState.buildLink}
            description={buildState.description}
            isEditable={isEditable}
            isPublic={buildState.isPublic}
            isScreenshotModeActive={isScreenshotMode}
            onChangeBuildLink={handleChangeBuildLink}
            onChangeDescription={handleChangeDescription}
            onChangeIsPublic={handleToggleIsPublic}
          />
        </div>

        {isScreenshotMode && (
          <div className="absolute bottom-[10px] right-[10px]">
            <Logo showUrl unoptimized={isScreenshotMode} />
          </div>
        )}
      </div>
    </>
  )
}
