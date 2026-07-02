'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('email and password are required')
      return
    }
    if (password.length < 6) {
      setError('password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error: err } = await signUp(email, password)
      if (err) {
        setError(err)
      } else {
        setMessage('check your email to confirm your account, then log in.')
      }
    } else {
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto pt-8">
      <h1 className="font-serif text-4xl tracking-tight mb-2">
        {mode === 'login' ? 'log in' : 'sign up'}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {mode === 'login'
          ? 'welcome back.'
          : 'create an account to save your profile and claim angles.'}
      </p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full glass-subtle rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 6 characters"
            className="w-full glass-subtle rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {message && <p className="text-xs text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-50"
        >
          {loading ? 'hold on...' : mode === 'login' ? 'log in' : 'sign up'}
        </button>

        <p className="text-xs text-center text-gray-400">
          {mode === 'login' ? (
            <>
              don&apos;t have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage('') }} className="text-accent hover:underline">
                sign up
              </button>
            </>
          ) : (
            <>
              already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }} className="text-accent hover:underline">
                log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
