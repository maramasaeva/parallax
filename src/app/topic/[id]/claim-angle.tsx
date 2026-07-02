'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'

export default function ClaimAngle({
  topicId,
  suggestedAngles,
}: {
  topicId: string
  suggestedAngles: string[]
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [creatorName, setCreatorName] = useState('')

  useEffect(() => {
    if (!user || !supabase) return
    supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) setCreatorName(data.name)
      })
  }, [user])
  const [angle, setAngle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!creatorName.trim() || !angle.trim()) {
      setError('name and angle are required')
      return
    }

    setLoading(true)
    setError('')

    const supabase = getSupabase()
    const { error: dbError } = await supabase
      .from('perspectives')
      .insert({
        topic_id: topicId,
        creator_name: creatorName.trim(),
        angle: angle.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim() || null,
      })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.refresh()
    setAngle('')
    setDescription('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleClaim} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-serif text-lg">claim your angle</h3>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">your name</label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="how others will see you"
          className="w-full glass-subtle rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">angle</label>
        {suggestedAngles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {suggestedAngles.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAngle(a)}
                className={`text-xs rounded-full px-3 py-1.5 transition-all ${
                  angle === a
                    ? 'bg-accent text-white shadow-sm'
                    : 'glass-button text-gray-500 hover:text-accent'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          placeholder="pick one above or write your own"
          className="w-full glass-subtle rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          brief description <span className="text-gray-300">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="what's your take going to look like?"
          className="w-full glass-subtle rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          video link <span className="text-gray-300">(add now or come back later)</span>
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          className="w-full glass-subtle rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="glass-button rounded-xl px-5 py-2.5 text-sm font-medium text-accent disabled:opacity-50"
      >
        {loading ? 'claiming...' : 'claim'}
      </button>
    </form>
  )
}
