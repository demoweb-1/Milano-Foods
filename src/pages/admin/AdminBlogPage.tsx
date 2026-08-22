import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, FileText, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@/types';

export function AdminBlogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const { data: posts } = useQuery({
    queryKey: ['admin-blog-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-all'] });
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast('Post deleted');
    },
  });

  const statusColors: Record<string, string> = {
    published: 'bg-success-50 text-success-600',
    draft: 'bg-cream-200 text-ink-600',
    scheduled: 'bg-gold/20 text-gold-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink-900">Blog</h1>
          <p className="text-sm text-muted mt-1">{posts?.length ?? 0} posts</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
        <div className="divide-y divide-cream-100">
          {posts?.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-cream-50 transition-colors">
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="h-12 w-12 rounded-lg object-cover bg-cream-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-900 truncate">{post.title}</p>
                <p className="text-xs text-muted">{post.category} · {post.published_at ? formatDate(post.published_at) : 'Not published'}</p>
              </div>
              <span className={`chip ${statusColors[post.status]} capitalize hidden sm:inline-flex`}>{post.status}</span>
              <div className="flex gap-1">
                {post.status === 'published' && (
                  <Link to={`/blog/${post.slug}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-cream-200 text-ink-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
                <button onClick={() => { setEditing(post); setShowForm(true); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-cream-200 text-ink-600 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post.id); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-error-50 hover:text-error-600 text-ink-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-10 w-10 text-ink-300 mx-auto mb-3" />
              <p className="text-muted">No blog posts yet</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <BlogFormModal
            post={editing}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['admin-blog-all'] });
              queryClient.invalidateQueries({ queryKey: ['blog'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BlogFormModal({ post, onClose, onSaved }: { post: BlogPost | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    cover_image: post?.cover_image ?? '',
    category: post?.category ?? '',
    tags: post?.tags.join(', ') ?? '',
    author: post?.author ?? 'Milano Foods',
    status: post?.status ?? 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        title: form.title,
        slug,
        excerpt: form.excerpt || null,
        content: form.content || null,
        cover_image: form.cover_image || null,
        category: form.category || null,
        tags,
        author: form.author || null,
        status: form.status,
        published_at: form.status === 'published' ? (post?.published_at ?? new Date().toISOString()) : null,
      };
      if (post) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', post.id);
        if (error) throw error;
        toast('Post updated');
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast('Post created');
      }
      onSaved();
    } catch {
      toast('Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto pointer-events-none">
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-cream rounded-2xl shadow-lift w-full max-w-2xl my-8 pointer-events-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white rounded-t-2xl">
              <h2 className="font-heading text-xl font-semibold text-ink-900">{post ? 'Edit Post' : 'New Post'}</h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="label">Title *</label>
                <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="label">Author</label>
                  <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input className="input" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Excerpt</label>
                <textarea className="input min-h-16" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div>
                <label className="label">Content (Markdown supported)</label>
                <textarea className="input min-h-48 font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' | 'scheduled' })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-cream-300 bg-white rounded-b-2xl">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (post ? 'Save Changes' : 'Create Post')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
