
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CommentSection from '@/components/CommentSection';
import { useArticle } from '@/hooks/useArticles';
import { Link } from 'react-router-dom';

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const { article, loading, error } = useArticle(slug || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{article.title} | TrendWise</title>
        <meta name="description" content={article.meta_description || article.excerpt || ''} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.image_url || ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.meta_description || article.excerpt || ''} />
        <meta name="twitter:image" content={article.image_url || ''} />
      </Helmet>

      <Navigation />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.publish_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.read_time}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image_url && (
          <div className="mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-gray-600">Content not available.</p>
          )}
        </div>

        {/* Tags Footer */}
        <div className="border-t pt-8 mb-8">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection articleId={article.id} />

      <Footer />
    </div>
  );
};

export default Article;
