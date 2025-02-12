import { TrashIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

import { removeBuildFromLoadout } from '@/app/profile/loadout-builds/actions'
import { Tooltip } from '@/features/ui/Tooltip'

export function RemoveFromLoadoutButton({
  buildId,
  slot,
  callback,
}: {
  buildId: string
  slot: number
  callback?: (success: boolean) => void
}) {
  return (
    <Tooltip content="Remove from loadout">
      <button
        className="flex flex-col items-center gap-y-1 text-xs text-red-500 hover:text-red-300"
        aria-label="Remove from your pinned loadouts"
        onClick={async () => {
          const confirmResponse = confirm(
            'Are you sure you want to remove this build from your loadout?',
          )

          if (!confirmResponse) {
            if (callback) callback(false)
            return
          }

          const response = await removeBuildFromLoadout(buildId, slot)
          if (!response.success) {
            if (callback) callback(false)
            toast.error('Failed to remove build from loadout')
            return
          }
          if (callback) callback(true)
          toast.success('Build removed from loadout')
        }}
      >
        <TrashIcon className="h-5 w-5" /> Remove
      </button>
    </Tooltip>
  )
}
