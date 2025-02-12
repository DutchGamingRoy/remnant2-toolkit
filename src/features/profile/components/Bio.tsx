'use client'

import { PencilIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { isErrorResponse } from '@/features/error-handling/isErrorResponse'
import { Textarea } from '@/features/ui/Textarea'

import { updateUserBio } from '../../../app/profile/actions'
import { MAX_PROFILE_BIO_LENGTH } from '../constants'

type Props = {
  bio: string
  editable: boolean
}

export function Bio({ bio, editable }: Props) {
  const [newBio, setNewBio] = useState<string>(bio)
  const [isEditing, setIsEditing] = useState(false)

  async function handleUpdateBio() {
    const response = await updateUserBio(JSON.stringify({ bio: newBio }))
    if (!response) return

    if (isErrorResponse(response)) {
      console.error(response.errors)
      toast.error('Error saving user bio. Please try again later.')
      return
    }
    toast.success(response.message)
  }

  return (
    <div className="flex flex-row items-center justify-start gap-x-2">
      {isEditing ? (
        <div className="flex flex-col items-end justify-center">
          <Textarea
            label={`Profile Bio (${
              newBio?.length ?? 0
            }/${MAX_PROFILE_BIO_LENGTH})`}
            name="bio"
            placeholder=""
            onChange={(e) => setNewBio(e.target.value)}
            value={newBio ?? bio}
            maxLength={MAX_PROFILE_BIO_LENGTH}
            rows={6}
            cols={70}
          />
          <button
            onClick={async () => {
              handleUpdateBio()
              setIsEditing(false)
            }}
            aria-label="Save bio"
            className="bg-primary-500 hover:bg-primary-300 mt-2 rounded-md p-2 text-white"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-start justify-start gap-x-2">
          <p className="whitespace-pre-wrap text-left  text-sm text-white">
            {bio}
          </p>
          {editable && (
            <button onClick={() => setIsEditing(true)} aria-label="Edit Bio">
              <PencilIcon
                className="text-primary-500 hover:text-primary-300 h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
