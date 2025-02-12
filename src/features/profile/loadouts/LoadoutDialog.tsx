import { set } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { addBuildToLoadout } from '@/app/profile/loadout-builds/actions'
import { getArrayOfLength } from '@/features/build/lib/getArrayOfLength'
import { DBBuild } from '@/features/build/types'
import { Dialog } from '@/features/ui/Dialog'
import { Skeleton } from '@/features/ui/Skeleton'

import { getLoadoutList } from './actions'
import { EmptyLoadoutCard } from './EmptyLoadoutCard'
import { LoadoutCard } from './LoadoutCard'

interface Props {
  buildId: string | null
  open: boolean
  onClose: () => void
}

export function LoadoutDialog({ buildId, open, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [loadoutList, setLoadoutList] = useState<
    Array<DBBuild & { slot: number }>
  >([])

  useEffect(() => {
    async function getItemsAsync() {
      const userLoadoutBuilds = await getLoadoutList()
      setLoadoutList(userLoadoutBuilds)
      setLoading(false)
    }
    getItemsAsync()
  }, [])

  async function addToLoadout(slot: number) {
    if (!buildId) {
      return
    }

    if (slot < 1 || slot > 8) {
      toast.error('Invalid slot')
      return
    }

    const response = await addBuildToLoadout(buildId, slot)
    if (!response.success) {
      toast.error('Failed to add build to loadout')
      onClose()
      return
    }
    toast.success('Build added to loadout')
    onClose()
  }

  function removeFromLoadout(slot: number) {
    const newLoadoutList = loadoutList.filter((build) => build.slot !== slot)
    setLoadoutList(newLoadoutList)
  }

  function swapLoadoutSlot({
    oldSlot,
    newSlot,
  }: {
    oldSlot: number
    newSlot: number
  }) {
    let newLoadoutList = [...loadoutList]

    newLoadoutList = newLoadoutList.map((build) => {
      if (build.slot === oldSlot) {
        return { ...build, slot: newSlot }
      }
      if (build.slot === newSlot) {
        return { ...build, slot: oldSlot }
      }
      return build
    })

    setLoadoutList(newLoadoutList)
  }

  return (
    <Dialog
      title="Loadouts"
      subtitle="Builds added to a loadout will be favorited. Unfavoriting a build will remove it from the loadout."
      maxWidthClass="max-w-6xl"
      open={open}
      onClose={onClose}
    >
      <div className="my-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {getArrayOfLength(8).map((_, index) => {
          if (loading) {
            return (
              <Skeleton
                key={index}
                className="col-span-1 flex h-full min-h-[350px] flex-col items-center justify-start rounded-lg border-4 border-dashed border-gray-500 bg-black text-center shadow"
              />
            )
          }

          const userLoadoutBuild = loadoutList.find(
            (build) => build.slot - 1 === index,
          )

          if (!userLoadoutBuild) {
            return (
              <button key={index} onClick={() => addToLoadout(index + 1)}>
                <EmptyLoadoutCard
                  key={index}
                  showHover={true}
                  label="Click to add build to this loadout slot."
                />
              </button>
            )
          }

          return (
            <LoadoutCard
              key={`${userLoadoutBuild.id}-${index}`}
              build={userLoadoutBuild}
              onRemove={() => removeFromLoadout(userLoadoutBuild.slot)}
              onSlotChange={(success, newLoadouts) => {
                if (success && newLoadouts) {
                  swapLoadoutSlot(newLoadouts)
                }
              }}
            />
          )
        })}
      </div>
    </Dialog>
  )
}
