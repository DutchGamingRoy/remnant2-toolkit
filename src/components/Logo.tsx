import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="-m-1.5 flex items-center justify-start p-1.5">
      <img
        className="mr-2 h-8 w-auto"
        src="/logo-sm.png"
        alt="Remnant 2 Toolkit logo, a purple and yellow toolbox."
      />
      <span className="text-white">Remnant Toolkit</span>
    </Link>
  )
}