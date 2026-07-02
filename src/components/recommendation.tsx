'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTagLabel } from '@/lib/categories'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'

interface Rec {
  topic: {
    id: string
    title: string
    summary: string
    tags: string[]
    complexity: string
    source_type: string
  }
  suggestion: {
    angle: string
    why: string
    hook: string
  }
  meta: {
    score: number
    matching_interests: string[]
    unclaimed_angles: number
  }
}

export default function Recommendation() {
  const { user, loading: authLoading } = useAuth()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [rec, setRec] = useState<Rec | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !user || !supabase) return
    supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfileId(data.id)
      })
  }, [user, authLoading])

  async function getRec() {
    if (!profileId) return
    setLoading(true)
    setError('')
    setRec(null)

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'failed')
      }

      setRec(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
    }
    setLoading(false)
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="glass-subtle rounded-2xl p-6 mb-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          log in and set up a profile to get personalized recommendations.
        </p>
        <Link
          href="/login"
          className="glass-button inline-block rounded-xl px-5 py-2.5 text-sm font-medium text-accent"
        >
          log in
        </Link>
      </div>
    )
  }

  if (!profileId) {
    return (
      <div className="glass-subtle rounded-2xl p-6 mb-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          set up a profile to get personalized topic recommendations.
        </p>
        <Link
          href="/profile"
          className="glass-button inline-block rounded-xl px-5 py-2.5 text-sm font-medium text-accent"
        >
          create profile
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {!rec && !loading && (
        <button
          onClick={getRec}
          className="w-full glass rounded-2xl p-6 text-center hover:border-accent/30 transition-all group"
        >
          <span className="font-serif text-lg group-hover:text-accent transition-colors">
            find me a topic
          </span>
          <p className="text-xs text-gray-400 mt-1">
            get a personalized recommendation based on your profile
          </p>
        </button>
      )}

      {loading && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-400 animate-pulse">finding the right topic for you...</p>
        </div>
      )}

      {error && (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={getRec} className="text-xs text-accent hover:underline">try again</button>
        </div>
      )}

      {rec && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">recommended for you</p>
              <Link href={`/topic/${rec.topic.id}`} className="font-serif text-lg hover:text-accent transition-colors">
                {rec.topic.title}
              </Link>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <span className={`text-[10px] rounded-full px-2 py-0.5 ${
                rec.topic.complexity === 'technical' ? 'bg-accent/10 text-accent' : 'bg-green-50 text-green-600'
              }`}>
                {rec.topic.complexity}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{rec.topic.summary}</p>

          <div className="glass-subtle rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1.5">suggested angle for you</p>
            <p className="text-sm font-medium text-accent">{rec.suggestion.angle}</p>
            <p className="text-xs text-gray-500 mt-1.5">{rec.suggestion.why}</p>
            <p className="text-xs text-gray-400 mt-3 italic">&ldquo;{rec.suggestion.hook}&rdquo;</p>
          </div>

          {rec.meta.matching_interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rec.meta.matching_interests.map(tag => (
                <span key={tag} className="text-[10px] glass-subtle rounded-full px-2.5 py-0.5 text-gray-500">
                  {tag}
                </span>
              ))}
              {rec.meta.unclaimed_angles > 0 && (
                <span className="text-[10px] text-gray-400 py-0.5">
                  {rec.meta.unclaimed_angles} angles still open
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              href={`/topic/${rec.topic.id}`}
              className="glass-button rounded-xl px-4 py-2 text-xs font-medium text-accent"
            >
              claim this angle
            </Link>
            <button
              onClick={getRec}
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              show me another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
