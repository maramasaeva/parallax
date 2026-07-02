'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTags = searchParams.getAll('tag')
  const activeParents = searchParams.getAll('cat')
  const complexity = searchParams.get('complexity')
  const sourceType = searchParams.get('source')

  const expandedCats = CATEGORIES.filter(c => activeParents.includes(c.id))
  const allSubs = expandedCats.flatMap(c => c.subs)

  function navigate(cats: string[], tags: string[], comp: string | null, src: string | null) {
    const params = new URLSearchParams()
    cats.forEach(c => params.append('cat', c))
    tags.forEach(t => params.append('tag', t))
    if (comp) params.set('complexity', comp)
    if (src) params.set('source', src)
    const qs = params.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  function toggleParent(id: string) {
    const cat = CATEGORIES.find(c => c.id === id)!
    if (activeParents.includes(id)) {
      const subIds = new Set(cat.subs.map(s => s.id))
      navigate(
        activeParents.filter(c => c !== id),
        activeTags.filter(t => !subIds.has(t)),
        complexity,
        sourceType,
      )
    } else {
      navigate(
        [...activeParents, id],
        [...activeTags, ...cat.subs.map(s => s.id)],
        complexity,
        sourceType,
      )
    }
  }

  function toggleSub(id: string) {
    if (activeTags.includes(id)) {
      navigate(activeParents, activeTags.filter(t => t !== id), complexity, sourceType)
    } else {
      navigate(activeParents, [...activeTags, id], complexity, sourceType)
    }
  }

  function setComplexity(value: string | null) {
    navigate(activeParents, activeTags, value === complexity ? null : value, sourceType)
  }

  function setSourceType(value: string | null) {
    navigate(activeParents, activeTags, complexity, value === sourceType ? null : value)
  }

  function clearAll() {
    router.push('/')
  }

  const hasAnyFilter = activeParents.length > 0 || complexity || sourceType

  return (
    <div className="mb-8 space-y-3">
      {/* parent categories */}
      <div className="flex flex-wrap gap-2 items-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => toggleParent(cat.id)}
            className={`text-sm rounded-full px-4 py-2 transition-all ${
              activeParents.includes(cat.id)
                ? 'bg-accent text-white shadow-sm'
                : 'glass-button text-gray-500 hover:text-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* sub-categories row */}
      {allSubs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allSubs.map(sub => (
            <button
              key={sub.id}
              onClick={() => toggleSub(sub.id)}
              className={`text-xs rounded-full px-3 py-1.5 transition-all ${
                activeTags.includes(sub.id)
                  ? 'bg-accent/80 text-white'
                  : 'glass-subtle text-gray-400 line-through decoration-gray-300'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* complexity + source filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 mr-1">depth:</span>
        {(['accessible', 'technical'] as const).map(level => (
          <button
            key={level}
            onClick={() => setComplexity(level)}
            className={`text-xs rounded-full px-3 py-1.5 transition-all ${
              complexity === level
                ? 'bg-accent text-white'
                : 'glass-button text-gray-500 hover:text-accent'
            }`}
          >
            {level}
          </button>
        ))}

        <span className="text-xs text-gray-400 ml-3 mr-1">source:</span>
        {([
          { value: 'arxiv', label: 'research papers' },
          { value: 'rss', label: 'news & blogs' },
          { value: 'newsletter', label: 'newsletters' },
          { value: 'manual', label: 'community' },
        ]).map(src => (
          <button
            key={src.value}
            onClick={() => setSourceType(src.value)}
            className={`text-xs rounded-full px-3 py-1.5 transition-all ${
              sourceType === src.value
                ? 'bg-accent text-white'
                : 'glass-button text-gray-500 hover:text-accent'
            }`}
          >
            {src.label}
          </button>
        ))}

        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-accent transition-colors ml-2"
          >
            clear all
          </button>
        )}
      </div>
    </div>
  )
}
