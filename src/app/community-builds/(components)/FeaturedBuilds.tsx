'use client'

import { useEffect, useState } from 'react'
import { FeaturedBuildsFilter, getFeaturedBuilds } from '../actions'
import BuildCard from '../../(components)/BuildCard'
import BuildList from '@/app/(components)/BuildList'
import usePagination from '@/app/(hooks)/usePagination'
import Link from 'next/link'
import BuildListFilters from '@/app/(components)/BuildListFilters'
import { DBBuild } from '@/app/(types)/build'

interface Props {
  itemsPerPage?: number
}

export default function FeaturedBuilds({ itemsPerPage = 8 }: Props) {
  const [builds, setBuilds] = useState<DBBuild[]>([])
  const [totalBuildCount, setTotalBuildCount] = useState<number>(0)
  const [filter, setFilter] = useState<FeaturedBuildsFilter>('date created')

  const {
    currentPage,
    firstVisibleItemNumber,
    lastVisibleItemNumber,
    pageNumbers,
    totalPages,
    handleSpecificPageClick,
    handleNextPageClick,
    handlePreviousPageClick,
  } = usePagination({
    totalItemCount: totalBuildCount,
    itemsPerPage,
  })

  // Fetch data
  useEffect(() => {
    const getItemsAsync = async () => {
      const response = await getFeaturedBuilds({
        itemsPerPage,
        pageNumber: currentPage,
        filter,
      })
      setBuilds(response.items)
      setTotalBuildCount(response.totalItemCount)
    }
    getItemsAsync()
  }, [currentPage, itemsPerPage, filter])

  function handleFilterChange(filter: string) {
    setFilter(filter as FeaturedBuildsFilter)
  }

  const filterOptions: FeaturedBuildsFilter[] = ['date created', 'upvotes']

  return (
    <>
      <BuildList
        label="Creator Spotlight"
        currentPage={currentPage}
        pageNumbers={pageNumbers}
        totalItems={totalBuildCount}
        totalPages={totalPages}
        firstVisibleItemNumber={firstVisibleItemNumber}
        lastVisibleItemNumber={lastVisibleItemNumber}
        onPreviousPage={handlePreviousPageClick}
        onNextPage={handleNextPageClick}
        onSpecificPage={handleSpecificPageClick}
        headerActions={
          <BuildListFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            options={filterOptions}
          />
        }
      >
        {builds.map((build) => (
          <div key={build.id} className="h-full w-full">
            <BuildCard
              build={build}
              onReportBuild={undefined}
              footerActions={
                <div className="flex items-center justify-end gap-2 p-2 text-sm">
                  <Link
                    href={`/builder/${build.id}`}
                    className="relative inline-flex items-center justify-center gap-x-3 rounded-br-lg border border-transparent p-4 text-sm font-semibold text-green-500 hover:text-green-700 hover:underline"
                  >
                    View Build
                  </Link>
                </div>
              }
            />
          </div>
        ))}
      </BuildList>
    </>
  )
}
