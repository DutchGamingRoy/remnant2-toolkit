import { getServerSession } from '@/app/(lib)/auth'
import DisplayName from './DisplayName'

export default async function Header() {
  const session = await getServerSession()
  if (!session?.user) return null

  const { image, displayName, name, email } = session.user

  return (
    <div className="flex items-center gap-x-8">
      {image && (
        <img
          src={image}
          alt={`Profile picture of ${name}`}
          className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
        />
      )}
      <div className="flex flex-col gap-0">
        <DisplayName name={displayName ?? name ?? 'Traveler'} />
        <span className="text-sm text-white">{name}</span>
        <span className="text-sm text-gray-400">{email}</span>
      </div>
    </div>
  )
}