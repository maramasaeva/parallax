import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSupabase } from '@/lib/supabase'
import type { Profile, Topic, Perspective } from '@/lib/types'
import { getTagLabel } from '@/lib/categories'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
  try {
    const { profile_id } = await req.json()
    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const [{ data: profile }, { data: topics }, { data: perspectives }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', profile_id).single(),
      supabase.from('topics').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('perspectives').select('*'),
    ])

    if (!profile) {
      return NextResponse.json({ error: 'profile not found' }, { status: 404 })
    }

    const p = profile as Profile & { custom_interests?: string[] | null }
    const allTopics = (topics || []) as Topic[]
    const allPerspectives = (perspectives || []) as Perspective[]

    const claimedByUser = new Set(
      allPerspectives.filter(pv => pv.creator_name.toLowerCase() === p.name.toLowerCase()).map(pv => pv.topic_id)
    )

    const perspectiveCountByTopic = new Map<string, number>()
    for (const pv of allPerspectives) {
      perspectiveCountByTopic.set(pv.topic_id, (perspectiveCountByTopic.get(pv.topic_id) || 0) + 1)
    }

    const interestSet = new Set(p.interests || [])
    const scored = allTopics
      .filter(t => !claimedByUser.has(t.id))
      .map(t => {
        let score = 0

        const topicTags = t.tags || []
        const matchingTags = topicTags.filter(tag => interestSet.has(tag))
        score += matchingTags.length * 3

        if (p.complexity_pref === 'both' || t.complexity === p.complexity_pref) {
          score += 2
        }

        const totalAngles = (t.suggested_angles || []).length
        const claimed = perspectiveCountByTopic.get(t.id) || 0
        const unclaimed = totalAngles - claimed
        if (unclaimed > 0) score += unclaimed

        const ageHours = (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60)
        if (ageHours < 24) score += 3
        else if (ageHours < 72) score += 1

        score += Math.random() * 2

        return { topic: t, score, matchingTags, unclaimed }
      })
      .sort((a, b) => b.score - a.score)

    const top = scored[0]
    if (!top) {
      return NextResponse.json({ error: 'no topics to recommend' }, { status: 404 })
    }

    const existingAngles = allPerspectives
      .filter(pv => pv.topic_id === top.topic.id)
      .map(pv => pv.angle)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: 'You are a creative content strategist. Always respond with valid JSON.',
      }, {
        role: 'user',
        content: `Recommend a content angle for this creator:

Creator profile:
- Name: ${p.name}
- Interests: ${(p.interests || []).map(i => getTagLabel(i)).join(', ')}${(p.custom_interests && p.custom_interests.length > 0) ? `\n- Also interested in: ${p.custom_interests.join(', ')}` : ''}
- Audience: ${p.audience}
- Formats: ${(p.formats || []).join(', ')}
- Tone: ${(p.tone || []).join(', ')}

Topic: "${top.topic.title}"
Summary: ${top.topic.summary}
Key points: ${(top.topic.key_points || []).join('; ')}

Angles already taken by others: ${existingAngles.length > 0 ? existingAngles.join(', ') : 'none yet'}
Suggested angles still available: ${(top.topic.suggested_angles || []).filter(a => !existingAngles.includes(a)).join(', ')}

Return a JSON object with:
- "angle": a specific angle tailored to this creator's style and audience (one short phrase)
- "why": one sentence explaining why this angle fits their profile
- "hook": a suggested opening line or hook for their content`,
      }],
    })

    const text = completion.choices[0]?.message?.content || ''
    const suggestion = JSON.parse(text)

    return NextResponse.json({
      topic: {
        id: top.topic.id,
        title: top.topic.title,
        summary: top.topic.summary,
        tags: top.topic.tags,
        complexity: top.topic.complexity,
        source_type: top.topic.source_type,
      },
      suggestion,
      meta: {
        score: Math.round(top.score),
        matching_interests: top.matchingTags.map(t => getTagLabel(t)),
        unclaimed_angles: top.unclaimed,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
