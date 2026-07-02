export interface FeedSource {
  name: string
  url: string
  type: 'rss' | 'arxiv'
}

export const FEEDS: FeedSource[] = [
  // arxiv — ai & science
  { name: 'arxiv cs.AI', url: 'https://rss.arxiv.org/rss/cs.AI', type: 'arxiv' },
  { name: 'arxiv cs.CL', url: 'https://rss.arxiv.org/rss/cs.CL', type: 'arxiv' },
  { name: 'arxiv cs.LG', url: 'https://rss.arxiv.org/rss/cs.LG', type: 'arxiv' },
  { name: 'arxiv q-bio', url: 'https://rss.arxiv.org/rss/q-bio', type: 'arxiv' },
  { name: 'arxiv physics.soc-ph', url: 'https://rss.arxiv.org/rss/physics.soc-ph', type: 'arxiv' },

  // tech & ai news
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', type: 'rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', type: 'rss' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', type: 'rss' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', type: 'rss' },

  // science & environment
  { name: 'Nature News', url: 'https://www.nature.com/nature.rss', type: 'rss' },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', type: 'rss' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', type: 'rss' },

  // culture, business & society
  { name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/all/', type: 'rss' },
  { name: 'Vox', url: 'https://www.vox.com/rss/index.xml', type: 'rss' },
  { name: 'Hacker News', url: 'https://hnrss.org/best', type: 'rss' },
  { name: 'Rest of World', url: 'https://restofworld.org/feed/', type: 'rss' },

  // gaming
  { name: 'Kotaku', url: 'https://kotaku.com/rss', type: 'rss' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', type: 'rss' },

  // newsletters
  { name: 'TLDR AI', url: 'https://tldr.tech/ai/rss', type: 'rss' },
  { name: 'TLDR Tech', url: 'https://tldr.tech/tech/rss', type: 'rss' },
]
