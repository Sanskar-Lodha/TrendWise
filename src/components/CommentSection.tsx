
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Heart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  likes: number;
  created_at: string;
  user_id: string;
}

interface CommentSectionProps {
  articleId: string;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            article_id: articleId,
            user_id: user.id,
            author_name: user.email?.split('@')[0] || 'Anonymous',
            content: newComment.trim(),
          }
        ]);

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast({
        title: "Comment posted successfully!",
        description: "Your comment has been added to the discussion.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error deleting comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[120px] mb-4"
            required
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-600 mb-4">Sign in to join the discussion</p>
          <Button variant="outline">Sign In to Comment</Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{comment.author_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {user?.id === comment.user_id && (
                <Button
                  onClick={() => handleDeleteComment(comment.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            <div className="flex items-center gap-4 mt-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Heart className="h-4 w-4 mr-1" />
                {comment.likes}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
