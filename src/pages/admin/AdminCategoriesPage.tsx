import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '@/types';

export function AdminCategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (error) throw error;
      return data as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast('Category deleted');
    },
    onError: () => toast('Cannot delete category — it may have products linked', 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink-900">Categories</h1>
          <p className="text-sm text-muted mt-1">{categories?.length ?? 0} categories</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-soft border border-cream-200 p-5 flex items-center gap-4">
            {cat.image_url && (
              <img src={cat.image_url} alt={cat.name} className="h-14 w-14 rounded-xl object-cover bg-cream-200 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-900">{cat.name}</p>
              <p className="text-xs text-muted truncate">{cat.description}</p>
              <div className="flex gap-1 mt-2">
                <button onClick={() => { setEditing(cat); setShowForm(true); }} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-cream-200 text-ink-600 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-error-50 hover:text-error-600 text-ink-600 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <CategoryFormModal
            category={editing}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['admin-categories-all'] });
              queryClient.invalidateQueries({ queryKey: ['categories'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryFormModal({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    image_url: category?.image_url ?? '',
    icon: category?.icon ?? '',
    display_order: category?.display_order ?? 0,
    is_featured: category?.is_featured ?? false,
    is_active: category?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const payload = {
        name: form.name,
        slug,
        description: form.description || null,
        image_url: form.image_url || null,
        icon: form.icon || null,
        display_order: Number(form.display_order),
        is_featured: form.is_featured,
        is_active: form.is_active,
      };
      if (category) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (error) throw error;
        toast('Category updated');
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        toast('Category created');
      }
      onSaved();
    } catch {
      toast('Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          className="bg-cream rounded-2xl shadow-lift w-full max-w-md pointer-events-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white rounded-t-2xl">
              <h2 className="font-heading text-lg font-semibold text-ink-900">{category ? 'Edit Category' : 'New Category'}</h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Slug (optional)</label>
                <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-16" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Icon</label>
                  <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. cake, bread" />
                </div>
                <div>
                  <label className="label">Display Order</label>
                  <input type="number" className="input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-cream-400 text-primary" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-cream-400 text-primary" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-cream-300 bg-white rounded-b-2xl">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (category ? 'Save' : 'Create')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
