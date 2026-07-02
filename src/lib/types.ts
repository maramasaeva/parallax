export interface Topic {
  id: string
  title: string
  source_url: string | null
  source_text: string
  summary: string | null
  key_points: string[] | null
  suggested_angles: string[] | null
  tags: string[] | null
  complexity: 'technical' | 'accessible'
  featured: boolean
  source_type: 'manual' | 'arxiv' | 'rss' | 'newsletter'
  created_at: string
}

export interface Profile {
  id: string
  name: string
  interests: string[]
  custom_interests: string[] | null
  audience: 'general' | 'technical' | 'mixed'
  complexity_pref: 'accessible' | 'technical' | 'both'
  formats: string[]
  tone: string[]
  created_at: string
}

export interface Perspective {
  id: string
  topic_id: string
  creator_name: string
  angle: string
  description: string | null
  video_url: string | null
  created_at: string
}
