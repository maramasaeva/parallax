import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSupabase } from '@/lib/supabase'
import { ALL_TAGS } from '@/lib/categories'

const openai = new OpenAI()

const TAG_LIST = ALL_TAGS.map(t => t.id).join(', ')

export async function POST(req: NextRequest) {
  try {
    const { source_url, source_text, tags: userTags, source_type } = await req.json()

    if (!source_text && !source_url) {
      return NextResponse.json({ error: 'provide source_text or source_url' }, { status: 400 })
    }

    const content = source_text || `[Content from: ${source_url}]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: 'You are a research distiller for content creators. Always respond with valid JSON.',
      }, {
        role: 'user',
        content: `Analyze the following content and return a JSON object with exactly these fields:

- "title": a concise, compelling title (max 80 chars)
- "summary": a 2-3 sentence plain-language summary that a content creator could use as a starting point for a video
- "key_points": an array of 4-6 key findings or facts, each one sentence
- "suggested_angles": an array of 5 distinct creative angles a content creator could take on this topic. Each angle should be a short phrase describing a unique perspective or framing (e.g. "the ethical dilemma angle", "the personal story angle", "the contrarian take"). Make them diverse — different tones, audiences, and formats.
- "tags": an array of 2-5 tag ids from this list that best describe the content. Pick both parent categories and specific sub-categories where relevant. Available tags: ${TAG_LIST}
- "complexity": either "technical" or "accessible". Use "technical" if the content is dense, academic, uses jargon, or requires domain expertise. Use "accessible" if it's written for a general audience.

Content:
${content}`,
      }],
    })

    const text = completion.choices[0]?.message?.content || ''
    let parsed: {
      title: string
      summary: string
      key_points: string[]
      suggested_angles: string[]
      tags: string[]
      complexity: string
    }

    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'failed to parse AI response' }, { status: 500 })
    }

    const validTagIds = new Set(ALL_TAGS.map(t => t.id))
    const aiTags = (parsed.tags || []).filter(t => validTagIds.has(t))
    const finalTags = userTags || aiTags

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('topics')
      .insert({
        title: parsed.title,
        source_url: source_url || null,
        source_text: source_text || '',
        summary: parsed.summary,
        key_points: parsed.key_points,
        suggested_angles: parsed.suggested_angles,
        tags: finalTags,
        complexity: parsed.complexity === 'technical' ? 'technical' : 'accessible',
        source_type: source_type || 'manual',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, suggested_tags: aiTags })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
