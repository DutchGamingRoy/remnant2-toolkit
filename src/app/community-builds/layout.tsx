'use server'

import { Metadata } from 'next'
import { Suspense } from 'react'

import { getTotalBuildCount } from '@/features/build/actions/getTotalBuildCount'
import { PageHeader } from '@/features/ui/PageHeader'

export async function generateMetadata(): Promise<Metadata> {
  const title = `Community Builds - Remnant 2 Toolkit`
  const description =
    'Remnant 2 Community Builds, a collection of builds shared by the community. Share your builds with the community and help others find the best builds for their playstyle.'

  return {
    title,
    description,
    openGraph: {
      title,
      description: description,
      siteName: 'Remnant 2 Toolkit',
      url: `https://remnant2toolkit.com/community-builds`,
      images: [
        {
          url: 'https://d2sqltdcj8czo5.cloudfront.net/toolkit/og-image-sm.jpg',
          width: 150,
          height: 150,
        },
      ],
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
  }
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageHeader
        title="Community Builds"
        subtitle={
          <span>
            Search from{' '}
            <span className="text-primary-500 text-2xl font-bold">
              {await getTotalBuildCount()}
            </span>{' '}
            community submitted builds!
          </span>
        }
      />
      <Suspense>{children}</Suspense>
    </>
  )
}
