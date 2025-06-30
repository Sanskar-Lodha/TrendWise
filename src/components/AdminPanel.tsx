
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, FileText, Zap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useArticles } from '@/hooks/useArticles';

const AdminPanel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalComments: 0,
    trendingTopics: 0
  });
  const { toast } = useToast();
  const { articles, refetch } = useArticles();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [articlesCount, commentsCount, topicsCount] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('trending_topics').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalArticles: articlesCount.count || 0,
        totalComments: commentsCount.count || 0,
        trendingTopics: topicsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFetchTrendingTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-trending-topics');
      
      if (error) throw error;

      toast({
        title: "Trending topics fetched!",
        description: `Successfully fetched trending topics. Available: ${data.availableTopics}`,
      });
      
      fetchStats();
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      toast({
        title: "Error fetching trending topics",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArticle = async () => {
    setLoading(true);
    try {
      // Get unused trending topics
      const { data: topics, error: topicsError } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('used_for_article', false)
        .order('search_volume', { ascending: false })
        .limit(1);

      if (topicsError) throw topicsError;

      if (!topics || topics.length === 0) {
        toast({
          title: "No trending topics available",
          description: "Fetch trending topics first to generate articles.",
          variant: "destructive",
        });
        return;
      }

      const selectedTopic = topics[0];
      
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          topic: selectedTopic.topic,
          source: selectedTopic.source
        }
      });
      
      if (error) throw error;

      toast({
        title: "Article generated!",
        description: `Successfully created article: ${data.article.title}`,
      });
      
      refetch();
      fetchStats();
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: "Error generating article",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TrendWise Admin Panel</h1>
          <p className="text-gray-600">Manage your blog content and trending topics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trendingTopics}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fetch Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Fetch the latest trending topics from Google Trends and Twitter to generate new articles.
              </p>
              <Button 
                onClick={handleFetchTrendingTopics} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Trending Topics'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use AI to generate a new SEO-optimized article from available trending topics.
              </p>
              <Button 
                onClick={handleGenerateArticle} 
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Article'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()} • {article.read_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.trending && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Trending
                      </span>
                    )}
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
