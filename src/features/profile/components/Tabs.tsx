'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/classnames'

const tabs = [
  {
    name: 'Created Builds',
    baseHref: '/profile/created-builds',
    href: '/profile/created-builds?includePatchAffectedBuilds=true',
  },
  {
    name: 'Favorited Builds',
    baseHref: '/profile/favorited-builds',
    href: '/profile/favorited-builds?includePatchAffectedBuilds=true',
  },
  {
    name: 'Loadouts',
    baseHref: '/profile/loadout-builds',
    href: '/profile/loadout-builds',
  },
]

export function Tabs() {
  const pathname = usePathname()

  // get the current tab based on the pathname
  const currentTab = tabs.find((tab) => pathname.includes(tab.baseHref))

  return (
    <div className="mt-4">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              tab.name === currentTab?.name
                ? 'border-primary-500 text-primary-500 hover:text-primary-300 hover:border-primary-300'
                : 'text-white hover:border-gray-400 hover:text-gray-400',
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
            )}
            aria-current={tab.name === currentTab?.name ? 'page' : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
