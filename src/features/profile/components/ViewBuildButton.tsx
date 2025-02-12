'use client'

import Link from 'next/link'

export function ViewBuildButton({
  buildId,
  buildName,
}: {
  buildId: string
  buildName: string
}) {
  return (
    <Link
      href={`${window.location.origin}/builder/${buildId}`}
      className="text-primary-500 hover:text-primary-300"
    >
      {buildName}
    </Link>
  )
}
