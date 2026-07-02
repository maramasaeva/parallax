import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Topic } from '@/lib/types'
import { getTagLabel } from '@/lib/categories'
import CategoryFilter from '@/components/category-filter'
import Recommendation from '@/components/recommendation'

export const dynamic = 'force-dynamic'

const SOURCE_LABELS: Record<string, string> = {
  arxiv: 'paper',
  rss: 'news',
  newsletter: 'newsletter',
  manual: 'community',
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const rawTags = params.tag
  const activeTags: string[] = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : []
  const complexity = typeof params.complexity === 'string' ? params.complexity : null
  const sourceType = typeof params.source === 'string' ? params.source : null

  let topics: Topic[] | null = null
  const hasFilters = activeTags.length > 0 || !!complexity || !!sourceType

  if (supabase) {
    const { data: allTopics } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })

    let filtered = (allTopics || []) as Topic[]

    if (activeTags.length > 0) {
      const tagSet = new Set(activeTags)
      filtered = filtered.filter(t =>
        (t.tags || []).some(tag => tagSet.has(tag))
      )
    }

    if (complexity) {
      filtered = filtered.filter(t => t.complexity === complexity)
    }

    if (sourceType) {
      filtered = filtered.filter(t => t.source_type === sourceType)
    }

    topics = filtered
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">feed</h1>
        <p className="text-sm text-gray-400 mt-2">
          recent research, distilled. pick a topic, find your angle.
        </p>
      </div>

      <Suspense>
        <Recommendation />
      </Suspense>

      <Suspense>
        <CategoryFilter />
      </Suspense>

      {(!topics || topics.length === 0) ? (
        <div className="glass rounded-2xl p-14 text-center">
          <p className="text-gray-400 text-sm">
            {!supabase
              ? 'supabase not configured — add env vars to .env.local'
              : hasFilters
                ? 'no topics match these filters.'
                : 'no topics yet.'
            }
          </p>
          {!hasFilters && (
            <Link
              href="/submit"
              className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
            >
              submit the first one &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="block glass rounded-2xl p-6 hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg group-hover:text-accent transition-colors">
                    {topic.title}
                  </h2>
                  {topic.summary && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {topic.summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(topic.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex gap-1.5">
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${
                      topic.complexity === 'technical'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {topic.complexity || 'accessible'}
                    </span>
                    <span className="text-[10px] glass-subtle rounded-full px-2 py-0.5 text-gray-400">
                      {SOURCE_LABELS[topic.source_type] || topic.source_type}
                    </span>
                  </div>
                </div>
              </div>
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] glass-subtle rounded-full px-2.5 py-0.5 text-gray-500"
                    >
                      {getTagLabel(tag)}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
