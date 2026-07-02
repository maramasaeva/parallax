'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, ALL_TAGS, getTagLabel } from '@/lib/categories'

type Step = 'input' | 'confirm-tags'

export default function SubmitPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [pendingId, setPendingId] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  function toggleTag(id: string) {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sourceUrl && !sourceText) {
      setError('paste a url or some text')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: sourceUrl || null, source_text: sourceText }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'failed to process')
      }

      const { id, suggested_tags } = await res.json()
      setPendingId(id)
      setSuggestedTags(suggested_tags || [])
      setSelectedTags(suggested_tags || [])
      setStep('confirm-tags')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
      setLoading(false)
    }
  }

  async function handleConfirmTags() {
    setLoading(true)
    try {
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      await supabase
        .from('topics')
        .update({ tags: selectedTags })
        .eq('id', pendingId)

      router.push(`/topic/${pendingId}`)
    } catch {
      router.push(`/topic/${pendingId}`)
    }
  }

  if (step === 'confirm-tags') {
    return (
      <div>
        <div className="mb-10">
          <h1 className="font-serif text-4xl tracking-tight">tag this topic</h1>
          <p className="text-sm text-gray-400 mt-2">
            we suggested some tags based on the content. adjust if needed.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-400 mb-3">suggested by ai</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map(id => (
              <span key={id} className="text-xs glass-button rounded-full px-3 py-1.5 text-accent">
                {getTagLabel(id)}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                className="flex items-center gap-2 w-full text-left"
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleTag(cat.id) }}
                  className={`text-xs rounded-full px-3 py-1.5 transition-all ${
                    selectedTags.includes(cat.id)
                      ? 'bg-accent text-white'
                      : 'glass-button text-gray-500 hover:text-accent'
                  }`}
                >
                  {cat.label}
                </button>
                <span className="text-gray-300 text-xs ml-auto">
                  {expandedCat === cat.id ? '−' : '+'}
                </span>
              </button>
              {expandedCat === cat.id && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-4">
                  {cat.subs.map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleTag(sub.id)}
                      className={`text-xs rounded-full px-3 py-1.5 transition-all ${
                        selectedTags.includes(sub.id)
                          ? 'bg-accent text-white'
                          : 'glass-button text-gray-500 hover:text-accent'
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

        <button
          onClick={handleConfirmTags}
          disabled={loading}
          className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-50"
        >
          {loading ? 'saving...' : 'confirm tags'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight">submit</h1>
        <p className="text-sm text-gray-400 mt-2">
          paste a research paper, article, or any text. we&apos;ll distill it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            source url <span className="text-gray-300">(optional)</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://arxiv.org/abs/..."
            className="w-full glass rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            content <span className="text-gray-300">(paste the text, abstract, or key sections)</span>
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={12}
            placeholder="paste the research paper, article, or any content here..."
            className="w-full glass rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-accent/40 transition-colors resize-y"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="glass-button rounded-xl px-6 py-3 text-sm font-medium text-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'distilling...' : 'distill'}
        </button>
      </form>
    </div>
  )
}
