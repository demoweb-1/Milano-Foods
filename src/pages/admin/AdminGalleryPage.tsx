import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '@/types';

export function AdminGalleryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: items } = useQuery({
    queryKey: ['admin-gallery-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-all'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast('Image deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink-900">Gallery</h1>
          <p className="text-sm text-muted mt-1">{items?.length ?? 0} images</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items?.map((item) => (
          <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-cream-200 shadow-soft border border-cream-200">
            <img src={item.image_url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/50 transition-colors flex flex-col justify-end p-3">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{item.title ?? 'Untitled'}</p>
                <p className="text-cream-300 text-xs">{item.category ?? 'Uncategorized'}</p>
                <button
                  onClick={() => { if (confirm('Delete this image?')) deleteMutation.mutate(item.id); }}
                  className="mt-2 grid h-8 w-8 place-items-center rounded-full bg-white/20 hover:bg-error-600 text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-cream-200">
            <ImageIcon className="h-10 w-10 text-ink-300 mx-auto mb-3" />
            <p className="text-muted">No gallery images yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <GalleryFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['admin-gallery-all'] }); queryClient.invalidateQueries({ queryKey: ['gallery'] }); }} />}
      </AnimatePresence>
    </div>
  );
}

function GalleryFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', alt_text: '', category: '', display_order: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('gallery_items').insert({
        title: form.title || null,
        image_url: form.image_url,
        alt_text: form.alt_text || null,
        category: form.category || null,
        display_order: Number(form.display_order),
        is_active: true,
      });
      if (error) throw error;
      toast('Image added');
      onSaved();
    } catch {
      toast('Failed to add image', 'error');
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
              <h2 className="font-heading text-lg font-semibold text-ink-900">Add Gallery Image</h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Image URL *</label>
                <input className="input" required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Title (optional)</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Alt Text (optional)</label>
                <input className="input" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} />
              </div>
              <div>
                <label className="label">Category (optional)</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Cakes, Bread, Interior" />
              </div>
              <div>
                <label className="label">Display Order</label>
                <input type="number" className="input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-cream-300 bg-white rounded-b-2xl">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Image'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
