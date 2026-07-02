'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'

export default function NavLinks() {
  const { user, loading, signOut } = useAuth()

  return (
    <>
      <Link href="/" className="text-gray-400 hover:text-accent transition-colors">
        feed
      </Link>
      <Link href="/submit" className="text-gray-400 hover:text-accent transition-colors">
        submit
      </Link>
      {!loading && (
        user ? (
          <>
            <Link href="/profile" className="text-gray-400 hover:text-accent transition-colors">
              profile
            </Link>
            <button
              onClick={() => signOut()}
              className="text-gray-400 hover:text-accent transition-colors"
            >
              log out
            </button>
          </>
        ) : (
          <Link href="/login" className="text-gray-400 hover:text-accent transition-colors">
            log in
          </Link>
        )
      )}
    </>
  )
}
