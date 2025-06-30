
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Share2, Bookmark, ArrowLeft, MessageCircle, Heart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const Article = () => {
  const { slug } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Tech Enthusiast',
      content: 'Great insights on AI trends! This really helps understand where the industry is heading.',
      date: '2024-01-15',
      likes: 5
    },
    {
      id: 2,
      author: 'Digital Marketer',
      content: 'The section on content personalization is particularly valuable. Thanks for sharing!',
      date: '2024-01-15',
      likes: 3
    }
  ]);

  // Mock article data - in real app, this would come from your database
  const article = {
    title: "The Future of AI in Content Creation: Trends Shaping 2024",
    slug: "future-ai-content-creation-2024",
    content: `
      <p>Artificial Intelligence is fundamentally transforming how we create, distribute, and consume content. As we move through 2024, several key trends are emerging that will shape the future of content creation.</p>
      
      <h2>1. Personalization at Scale</h2>
      <p>AI-powered content personalization is becoming more sophisticated, allowing creators to tailor content to individual preferences and behaviors. This trend is revolutionizing how businesses engage with their audiences.</p>
      
      <h2>2. Automated Content Generation</h2>
      <p>From blog posts to social media content, AI tools are becoming increasingly capable of generating high-quality content that resonates with specific audiences. The key is finding the right balance between automation and human creativity.</p>
      
      <h2>3. Enhanced Content Analytics</h2>
      <p>AI-driven analytics are providing deeper insights into content performance, helping creators understand what works and why. This data-driven approach is essential for content strategy optimization.</p>
      
      <h2>The Human Element</h2>
      <p>While AI capabilities continue to expand, the human element remains crucial. The most successful content strategies combine AI efficiency with human creativity and emotional intelligence.</p>
    `,
    author: "TrendWise AI",
    publishDate: "2024-01-15",
    readTime: "5 min read",
    tags: ["AI", "Technology", "Content", "Trends"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    metaDescription: "Discover how artificial intelligence is revolutionizing content creation and what it means for creators and businesses in 2024."
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    
    const newComment = {
      id: comments.length + 1,
      author: 'Current User',
      content: comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    
    setComments([...comments, newComment]);
    setComment('');
  };

  return (
    <>
      <Helmet>
        <title>{article.title} - TrendWise</title>
        <meta name="description" content={article.metaDescription} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription} />
        <meta name="twitter:image" content={article.image} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {article.author.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Comments Section */}
          <section className="border-t pt-12">
            <div className="flex items-center gap-2 mb-8">
              <MessageCircle className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Comments ({comments.length})
              </h2>
            </div>

            {/* Comment Form */}
            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <Button type="submit" disabled={!comment.trim()}>
                  Post Comment
                </Button>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
                <Button onClick={() => setIsLoggedIn(true)}>
                  Sign In to Comment
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                        <p className="text-sm text-gray-600">{new Date(comment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {comment.likes}
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default Article;
