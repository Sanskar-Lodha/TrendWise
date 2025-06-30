
import { useState } from 'react';
import { Search, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';
import { useArticles } from '@/hooks/useArticles';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { articles, loading, error } = useArticles();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const trendingArticles = filteredArticles.filter(article => article.trending);

  // Convert database article format to component format
  const formatArticleForCard = (article: any) => ({
    id: parseInt(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    author: article.author,
    publishDate: article.publish_date,
    readTime: article.read_time || '5 min read',
    tags: article.tags || [],
    image: article.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    trending: article.trending || false
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading articles: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <Hero />

      {/* Search Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles, topics, or trends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
            </div>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={formatArticleForCard(article)} 
                featured 
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
          <Button variant="outline" className="flex items-center gap-2">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={formatArticleForCard(article)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Ahead of the Trends
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest trending topics and AI-generated insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-gray-900"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
