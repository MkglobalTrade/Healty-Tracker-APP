'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Newspaper, ExternalLink, Clock, Tag, RefreshCw, Loader2, BookOpen, Microscope, Heart, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useHealthData } from '@/hooks/useHealthData'
import { fetchHealthNews } from '@/lib/ai'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, { color: string; icon: React.ReactNode }> = {
  Breakthrough: { color: '#ef4444', icon: <Microscope className="w-4 h-4" /> },
  Research: { color: '#3b82f6', icon: <BookOpen className="w-4 h-4" /> },
  Technology: { color: '#8b5cf6', icon: <Brain className="w-4 h-4" /> },
  Neuroscience: { color: '#ec4899', icon: <Brain className="w-4 h-4" /> },
  Longevity: { color: '#10b981', icon: <Heart className="w-4 h-4" /> },
  Health: { color: '#0ea5e9', icon: <Heart className="w-4 h-4" /> },
  Debate: { color: '#f59e0b', icon: <BookOpen className="w-4 h-4" /> },
}

export default function NewsPage() {
  const { news, addNews } = useHealthData()
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadNews = async () => {
    setLoading(true)
    try {
      const articles = await fetchHealthNews()
      articles.forEach(article => {
        addNews(article)
      })
    } catch (error) {
      console.error('Failed to load news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (news.length === 0) {
      loadNews()
    }
  }, [])

  const categories = ['all', ...Array.from(new Set(news.map(n => n.category)))]

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(n => n.category === selectedCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health News</h1>
          <p className="text-sm text-muted-foreground">Latest on longevity, breakthroughs, and health debates</p>
        </div>
        <Button onClick={loadNews} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No news yet</p>
          <Button onClick={loadNews} className="mt-4 gap-2">
            <Loader2 className={cn('w-4 h-4', loading && 'animate-spin')} />
            Load News
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((article) => {
            const catStyle = CATEGORY_COLORS[article.category] || { color: '#6b7280', icon: <Newspaper className="w-4 h-4" /> }
            return (
              <Card key={article.id} className="hover:shadow-md transition-all flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex items-center gap-1"
                      style={{ backgroundColor: catStyle.color }}
                    >
                      {catStyle.icon}
                      {article.category}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-tight">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">{article.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                    </div>
                    {article.sourceUrl && (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Read more
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
