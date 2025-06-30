
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles] = useState([
    {
      id: 1,
      title: "The Future of AI in Content Creation: Trends Shaping 2024",
      slug: "future-ai-content-creation-2024",
      excerpt: "Discover how artificial intelligence is revolutionizing content creation and what it means for creators and businesses.",
      author: "TrendWise AI",
      publishDate: "2024-01-15",
      readTime: "5 min read",
      tags: ["AI", "Technology", "Content"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      trending: true
    },
    {
      id: 2,
      title: "Social Media Trends That Will Dominate This Year",
      slug: "social-media-trends-2024",
      excerpt: "From short-form videos to AI-powered personalization, explore the social media trends reshaping digital marketing.",
      author: "TrendWise AI",
      publishDate: "2024-01-14",
      readTime: "7 min read",
      tags: ["Social Media", "Marketing", "Trends"],
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=800&q=80",
      trending: false
    },
    {
      id: 3,
      title: "Sustainable Technology: Green Innovations Taking Center Stage",
      slug: "sustainable-technology-green-innovations",
      excerpt: "How eco-friendly tech solutions are becoming mainstream and driving the next wave of innovation.",
      author: "TrendWise AI",
      publishDate: "2024-01-13",
      readTime: "6 min read",
      tags: ["Sustainability", "Technology", "Environment"],
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      trending: true
    },
    {
      id: 4,
      title: "Remote Work Evolution: The New Digital Workplace",
      slug: "remote-work-evolution-digital-workplace",
      excerpt: "Analyzing how remote work continues to evolve and shape the future of business operations.",
      author: "TrendWise AI",
      publishDate: "2024-01-12",
      readTime: "8 min read",
      tags: ["Remote Work", "Business", "Technology"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
      trending: false
    }
  ]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles
            .filter(article => article.trending)
            .map(article => (
              <ArticleCard key={article.id} article={article} featured />
            ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
          <Button variant="outline" className="flex items-center gap-2">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
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
