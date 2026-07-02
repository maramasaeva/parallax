import { getSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Topic, Perspective } from '@/lib/types'
import { getTagLabel } from '@/lib/categories'
import ClaimAngle from './claim-angle'

export const dynamic = 'force-dynamic'

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabase()

  const [{ data: topic }, { data: perspectives }] = await Promise.all([
    supabase.from('topics').select('*').eq('id', id).single(),
    supabase.from('perspectives').select('*').eq('topic_id', id).order('created_at', { ascending: true }),
  ])

  if (!topic) notFound()

  const t = topic as Topic
  const claimed = (perspectives || []) as Perspective[]
  const claimedAngles = claimed.map(p => p.angle)
  const availableAngles = (t.suggested_angles || []).filter(a => !claimedAngles.includes(a))

  return (
    <div>
      <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors">
        &larr; feed
      </Link>

      <div className="mt-4 mb-10">
        <h1 className="font-serif text-3xl tracking-tight leading-snug">{t.title}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {t.source_url && (
            <a
              href={t.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-accent transition-colors"
            >
              {t.source_url} &nearr;
            </a>
          )}
          {t.tags && t.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {t.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/?tag=${tag}`}
                  className="text-[11px] glass-button rounded-full px-2.5 py-0.5 text-gray-500 hover:text-accent"
                >
                  {getTagLabel(tag)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-sm text-gray-400 mb-3">summary</h2>
        <p className="text-sm leading-relaxed text-gray-600">{t.summary}</p>
      </section>

      {t.key_points && t.key_points.length > 0 && (
        <section className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-sm text-gray-400 mb-4">key points</h2>
          <ul className="space-y-3">
            {t.key_points.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-accent font-medium shrink-0 text-xs mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-600 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-5">
        <h2 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
          perspectives taken
          {claimed.length > 0 && (
            <span className="glass-button text-accent text-[10px] font-medium px-2 py-0.5 rounded-full">
              {claimed.length}
            </span>
          )}
        </h2>
        {claimed.length === 0 ? (
          <div className="glass-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">no one has claimed an angle yet. be first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claimed.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{p.creator_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-accent mt-1.5">{p.angle}</p>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{p.description}</p>
                )}
                {p.video_url && (
                  <a
                    href={p.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-accent hover:underline"
                  >
                    watch the video &nearr;
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-sm text-gray-400 mb-4">available angles</h2>
        {availableAngles.length === 0 && (t.suggested_angles || []).length > 0 ? (
          <p className="text-sm text-gray-400 mb-4">all suggested angles have been claimed. write your own below.</p>
        ) : availableAngles.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {availableAngles.map((angle, i) => (
              <span
                key={i}
                className="text-xs glass-button rounded-full px-3 py-1.5 text-gray-500 hover:text-accent transition-colors cursor-default"
              >
                {angle}
              </span>
            ))}
          </div>
        ) : null}

        <ClaimAngle topicId={t.id} suggestedAngles={availableAngles} />
      </section>
    </div>
  )
}
