export interface Category {
  id: string
  label: string
  subs: { id: string; label: string }[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'ai',
    label: 'ai',
    subs: [
      { id: 'ai-safety', label: 'ai safety & risk' },
      { id: 'ai-art', label: 'ai art & creativity' },
      { id: 'ai-agents', label: 'agents & tools' },
      { id: 'ai-oss', label: 'open source models' },
      { id: 'ai-policy', label: 'policy & governance' },
      { id: 'ai-ethics', label: 'ai ethics & bias' },
    ],
  },
  {
    id: 'technology',
    label: 'technology',
    subs: [
      { id: 'tech-social', label: 'social media & platforms' },
      { id: 'tech-crypto', label: 'crypto & web3' },
      { id: 'tech-hardware', label: 'hardware & chips' },
      { id: 'tech-devtools', label: 'developer tools' },
      { id: 'tech-apps', label: 'apps & products' },
      { id: 'tech-cybersecurity', label: 'cybersecurity' },
      { id: 'tech-gaming-tech', label: 'gaming tech & vr' },
    ],
  },
  {
    id: 'science',
    label: 'science',
    subs: [
      { id: 'sci-neuro', label: 'neuroscience & cognition' },
      { id: 'sci-climate', label: 'climate & energy' },
      { id: 'sci-biotech', label: 'biotech & health' },
      { id: 'sci-physics', label: 'physics & space' },
      { id: 'sci-psychology', label: 'psychology' },
      { id: 'sci-ecology', label: 'ecology & nature' },
    ],
  },
  {
    id: 'art-culture',
    label: 'art & culture',
    subs: [
      { id: 'art-music', label: 'music & sound' },
      { id: 'art-visual', label: 'visual art & design' },
      { id: 'art-film', label: 'film & video' },
      { id: 'art-writing', label: 'writing & publishing' },
      { id: 'art-fashion', label: 'fashion' },
      { id: 'art-photography', label: 'photography' },
      { id: 'art-architecture', label: 'architecture & spaces' },
    ],
  },
  {
    id: 'philosophy',
    label: 'philosophy',
    subs: [
      { id: 'phil-ethics', label: 'ethics & morality' },
      { id: 'phil-consciousness', label: 'consciousness' },
      { id: 'phil-political', label: 'political philosophy' },
      { id: 'phil-epistemology', label: 'epistemology' },
      { id: 'phil-existentialism', label: 'existentialism & meaning' },
    ],
  },
  {
    id: 'media-society',
    label: 'media & society',
    subs: [
      { id: 'media-creator', label: 'creator economy' },
      { id: 'media-journalism', label: 'journalism & trust' },
      { id: 'media-education', label: 'education' },
      { id: 'media-economics', label: 'economics & labor' },
      { id: 'media-politics', label: 'politics & policy' },
      { id: 'media-culture-wars', label: 'internet culture' },
    ],
  },
  {
    id: 'lifestyle',
    label: 'lifestyle',
    subs: [
      { id: 'life-vlogs', label: 'vlogs & day-in-the-life' },
      { id: 'life-travel', label: 'travel' },
      { id: 'life-food', label: 'food & cooking' },
      { id: 'life-fitness', label: 'fitness & movement' },
      { id: 'life-wellness', label: 'wellness & mental health' },
      { id: 'life-relationships', label: 'relationships & dating' },
      { id: 'life-parenting', label: 'parenting' },
    ],
  },
  {
    id: 'business',
    label: 'business',
    subs: [
      { id: 'biz-startups', label: 'startups & founders' },
      { id: 'biz-marketing', label: 'marketing & growth' },
      { id: 'biz-finance', label: 'personal finance & investing' },
      { id: 'biz-freelance', label: 'freelancing & solopreneurs' },
      { id: 'biz-leadership', label: 'leadership & management' },
    ],
  },
  {
    id: 'gaming',
    label: 'gaming',
    subs: [
      { id: 'game-reviews', label: 'game reviews & analysis' },
      { id: 'game-esports', label: 'esports & competitive' },
      { id: 'game-design', label: 'game design & dev' },
      { id: 'game-lore', label: 'lore & storytelling' },
      { id: 'game-retro', label: 'retro & indie' },
    ],
  },
  {
    id: 'self-dev',
    label: 'personal development',
    subs: [
      { id: 'dev-productivity', label: 'productivity & systems' },
      { id: 'dev-learning', label: 'learning & skill-building' },
      { id: 'dev-career', label: 'career & job market' },
      { id: 'dev-creativity', label: 'creativity & process' },
      { id: 'dev-mindset', label: 'mindset & habits' },
    ],
  },
  {
    id: 'history',
    label: 'history & politics',
    subs: [
      { id: 'hist-modern', label: 'modern history' },
      { id: 'hist-ancient', label: 'ancient & medieval' },
      { id: 'hist-geopolitics', label: 'geopolitics' },
      { id: 'hist-war', label: 'conflict & diplomacy' },
      { id: 'hist-social-movements', label: 'social movements' },
    ],
  },
  {
    id: 'comedy',
    label: 'comedy & entertainment',
    subs: [
      { id: 'comedy-sketch', label: 'sketch & skits' },
      { id: 'comedy-commentary', label: 'commentary & reaction' },
      { id: 'comedy-standup', label: 'standup & improv' },
      { id: 'comedy-memes', label: 'memes & internet humor' },
    ],
  },
]

export const ALL_TAGS = CATEGORIES.flatMap(c => [
  { id: c.id, label: c.label, parent: null },
  ...c.subs.map(s => ({ id: s.id, label: s.label, parent: c.id })),
])

export function getTagLabel(id: string): string {
  return ALL_TAGS.find(t => t.id === id)?.label || id
}
