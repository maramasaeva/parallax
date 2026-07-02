'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { AUDIENCE_OPTIONS, FORMAT_OPTIONS, TONE_OPTIONS } from '@/lib/profile-options'
import { useAuth } from '@/components/auth-provider'

type Step = 'name' | 'interests' | 'audience' | 'format' | 'tone' | 'done'
const STEPS: Step[] = ['name', 'interests', 'audience', 'format', 'tone']

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState<Step>('name')
  const [loading, setLoading] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [name, setName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [customInterests, setCustomInterests] = useState('')
  const [audience, setAudience] = useState('general')
  const [formats, setFormats] = useState<string[]>([])
  const [tone, setTone] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProfileLoading(false)
      return
    }
    loadProfileByUser(user.id)
  }, [user, authLoading])

  async function loadProfileByUser(userId: string) {
    const supabase = getSupabase()
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
    if (data) {
      setExistingId(data.id)
      setName(data.name || '')
      setInterests(data.interests || [])
      setCustomInterests((data.custom_interests || []).join(', '))
      setAudience(data.audience || 'general')
      setFormats(data.formats || [])
      setTone(data.tone || [])
    }
    setProfileLoading(false)
  }

  function toggleList(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  function next() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
    else save()
  }

  function back() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  async function save() {
    setLoading(true)
    const supabase = getSupabase()
    const parsedCustom = customInterests
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)

    const profile = {
      name,
      interests,
      custom_interests: parsedCustom.length > 0 ? parsedCustom : null,
      audience,
      complexity_pref: audience === 'technical' ? 'technical' : audience === 'general' ? 'accessible' : 'both',
      formats,
      tone,
    }

    if (existingId) {
      await supabase.from('profiles').update(profile).eq('id', existingId)
      setStep('done')
    } else {
      const { data } = await supabase.from('profiles').insert({
        ...profile,
        user_id: user?.id ?? null,
      }).select('id').single()
      if (data) {
        setExistingId(data.id)
      }
      setStep('done')
    }
    setLoading(false)
  }

  const stepIdx = STEPS.indexOf(step)
  const progress = step === 'done' ? 100 : ((stepIdx + 1) / STEPS.length) * 100

  if (authLoading || profileLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 animate-pulse">loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h1 className="font-serif text-3xl mb-4">log in to set up your profile</h1>
        <p className="text-sm text-gray-500 mb-8">
          your profile saves your interests, style, and preferences for personalized recommendations.
        </p>
        <Link
          href="/login"
          className="glass-button inline-block rounded-xl px-6 py-3 text-sm font-medium text-accent"
        >
          log in or sign up
        </Link>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="text-center py-16">
        <h1 className="font-serif text-3xl mb-4">you're all set, {name}.</h1>
        <p className="text-sm text-gray-500 mb-8">
          your recommendations are now personalized.
        </p>
        <button
          onClick={() => router.push('/')}
          className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent"
        >
          go to feed
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">
          {existingId ? 'edit profile' : 'set up your profile'}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          so we can recommend topics that match how you create.
        </p>
      </div>

      {/* progress */}
      <div className="h-1 bg-gray-200 rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* name */}
      {step === 'name' && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-xl mb-2">what should we call you?</h2>
          <p className="text-sm text-gray-400 mb-6">this is how other creators will see you.</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name or handle"
            className="w-full glass-subtle rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors mb-6"
            autoFocus
          />
          <button
            onClick={next}
            disabled={!name.trim()}
            className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-30"
          >
            next
          </button>
        </div>
      )}

      {/* interests */}
      {step === 'interests' && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-xl mb-2">what do you make content about?</h2>
          <p className="text-sm text-gray-400 mb-6">pick everything that's relevant. you can always change this later.</p>
          <div className="space-y-4 mb-6">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => toggleList(interests, cat.id, setInterests)}
                  className={`text-sm rounded-full px-4 py-2 transition-all ${
                    interests.includes(cat.id)
                      ? 'bg-accent text-white shadow-sm'
                      : 'glass-button text-gray-500 hover:text-accent'
                  }`}
                >
                  {cat.label}
                </button>
                {interests.includes(cat.id) && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                    {cat.subs.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => toggleList(interests, sub.id, setInterests)}
                        className={`text-xs rounded-full px-3 py-1.5 transition-all ${
                          interests.includes(sub.id)
                            ? 'bg-accent/80 text-white'
                            : 'glass-subtle text-gray-400 hover:text-accent'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-8">
            <p className="text-xs text-gray-400 mb-2">anything else you make content about?</p>
            <input
              type="text"
              value={customInterests}
              onChange={(e) => setCustomInterests(e.target.value)}
              placeholder="e.g. diy electronics, true crime, skincare, urbanism"
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
            />
            <p className="text-[11px] text-gray-300 mt-1.5">separate with commas</p>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="text-sm text-gray-400 hover:text-accent transition-colors">back</button>
            <button
              onClick={next}
              disabled={interests.length === 0}
              className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-30"
            >
              next
            </button>
          </div>
        </div>
      )}

      {/* audience */}
      {step === 'audience' && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-xl mb-2">who's your audience?</h2>
          <p className="text-sm text-gray-400 mb-6">this helps us match the right depth of content to you.</p>
          <div className="space-y-3 mb-8">
            {AUDIENCE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAudience(opt.id)}
                className={`block w-full text-left rounded-xl px-5 py-4 transition-all ${
                  audience === opt.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'glass-subtle text-gray-600 hover:border-accent/30'
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <span className={`block text-xs mt-0.5 ${audience === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="text-sm text-gray-400 hover:text-accent transition-colors">back</button>
            <button onClick={next} className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent">
              next
            </button>
          </div>
        </div>
      )}

      {/* format */}
      {step === 'format' && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-xl mb-2">how do you create?</h2>
          <p className="text-sm text-gray-400 mb-6">pick all the formats you work in.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleList(formats, opt.id, setFormats)}
                className={`text-sm rounded-full px-4 py-2 transition-all ${
                  formats.includes(opt.id)
                    ? 'bg-accent text-white shadow-sm'
                    : 'glass-button text-gray-500 hover:text-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="text-sm text-gray-400 hover:text-accent transition-colors">back</button>
            <button
              onClick={next}
              disabled={formats.length === 0}
              className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-30"
            >
              next
            </button>
          </div>
        </div>
      )}

      {/* tone */}
      {step === 'tone' && (
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-xl mb-2">what's your style?</h2>
          <p className="text-sm text-gray-400 mb-6">pick the tones that describe how you present content.</p>
          <div className="space-y-2 mb-8">
            {TONE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleList(tone, opt.id, setTone)}
                className={`block w-full text-left rounded-xl px-5 py-3 transition-all ${
                  tone.includes(opt.id)
                    ? 'bg-accent text-white shadow-sm'
                    : 'glass-subtle text-gray-600 hover:border-accent/30'
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <span className={`text-xs ml-2 ${tone.includes(opt.id) ? 'text-white/70' : 'text-gray-400'}`}>
                  — {opt.desc}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="text-sm text-gray-400 hover:text-accent transition-colors">back</button>
            <button
              onClick={save}
              disabled={tone.length === 0 || loading}
              className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-30"
            >
              {loading ? 'saving...' : 'finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
