import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { getSupabase } from '@/lib/supabase'
import { FEEDS } from '@/lib/feeds'
import { ALL_TAGS } from '@/lib/categories'

const parser = new Parser()
const openai = new OpenAI()
const TAG_LIST = ALL_TAGS.map(t => t.id).join(', ')

const MAX_ITEMS_PER_FEED = 3
const MAX_TOTAL = 20

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('topics')
    .select('source_url')
    .not('source_url', 'is', null)

  const existingUrls = new Set((existing || []).map(t => t.source_url))

  const candidates: { title: string; url: string; snippet: string; source: string; type: 'rss' | 'arxiv' }[] = []

  const feedResults = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url)
        return (parsed.items || []).slice(0, MAX_ITEMS_PER_FEED).map(item => ({
          title: item.title || '',
          url: item.link || '',
          snippet: item.contentSnippet || item.content || item.summary || '',
          source: feed.name,
          type: feed.type,
        }))
      } catch {
        return []
      }
    })
  )

  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      candidates.push(...result.value)
    }
  }

  const fresh = candidates
    .filter(c => c.url && !existingUrls.has(c.url))
    .slice(0, MAX_TOTAL)

  if (fresh.length === 0) {
    return NextResponse.json({ message: 'no new articles found', added: 0 })
  }

  let added = 0

  for (const item of fresh) {
    try {
      const content = `Title: ${item.title}\n\n${item.snippet.slice(0, 2000)}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{
          role: 'system',
          content: 'You are a research distiller for content creators. Always respond with valid JSON.',
        }, {
          role: 'user',
          content: `Analyze the following article and return a JSON object with exactly these fields:

- "title": a concise, compelling title (max 80 chars)
- "summary": a 2-3 sentence plain-language summary that a content creator could use as a starting point for a video
- "key_points": an array of 3-5 key findings or facts, each one sentence
- "suggested_angles": an array of 4 distinct creative angles a content creator could take. Each should be a short phrase.
- "tags": an array of 2-4 tag ids from: ${TAG_LIST}
- "complexity": either "technical" or "accessible". Use "technical" if the content is dense, academic, uses jargon, or requires domain expertise. Use "accessible" if it's written for a general audience.
- "relevance_score": a number 1-10 rating how interesting this would be for content creators. Consider broad appeal: AI, tech, science, culture, philosophy, gaming, business, lifestyle, history, comedy, personal development — anything a creator could make a compelling video about

Content:
${content}`,
        }],
      })

      const text = completion.choices[0]?.message?.content || ''
      const parsed = JSON.parse(text)

      if ((parsed.relevance_score || 0) < 5) continue

      const validTagIds = new Set(ALL_TAGS.map(t => t.id))
      const tags = (parsed.tags || []).filter((t: string) => validTagIds.has(t))

      await supabase.from('topics').insert({
        title: parsed.title || item.title,
        source_url: item.url,
        source_text: item.snippet.slice(0, 5000),
        summary: parsed.summary,
        key_points: parsed.key_points,
        suggested_angles: parsed.suggested_angles,
        tags,
        complexity: parsed.complexity === 'technical' ? 'technical' : 'accessible',
        source_type: item.type,
      })

      added++
    } catch {
      continue
    }
  }

  return NextResponse.json({ message: 'aggregation complete', added, checked: fresh.length })
}
