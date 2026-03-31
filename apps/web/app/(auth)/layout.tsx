import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#29d9d5] px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/login" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)' }}
          >
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path
                d="M18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32C25.732 32 32 25.732 32 18C32 10.268 25.732 4 18 4ZM18 8C21.314 8 24.314 9.344 26.485 11.515L11.515 26.485C9.344 24.314 8 21.314 8 18C8 12.477 12.477 8 18 8ZM18 28C14.686 28 11.686 26.656 9.515 24.485L24.485 9.515C26.656 11.686 28 14.686 28 18C28 23.523 23.523 28 18 28Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">RiseUp</span>
        </Link>
        <p className="text-sm text-white/70">Gestão para clínicas odontológicas</p>
      </div>

      {children}
    </div>
  )
}
