import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Search, Plus, Pencil, Trash2, Copy, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/types';

export function AdminProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

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
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast('Product deleted');
    },
    onError: () => toast('Failed to delete product', 'error'),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { id, created_at, updated_at, slug, ...rest } = product;
      const newSlug = `${slug}-copy-${Date.now().toString().slice(-4)}`;
      const { error } = await supabase.from('products').insert({ ...rest, slug: newSlug, name: `${product.name} (Copy)` });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
      toast('Product duplicated');
    },
    onError: () => toast('Failed to duplicate product', 'error'),
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const stockColors: Record<string, string> = {
    in_stock: 'bg-success-50 text-success-600',
    low_stock: 'bg-warning-50 text-warning-600',
    out_of_stock: 'bg-error-50 text-error-600',
    preorder: 'bg-gold/20 text-gold-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-muted mt-1">{filtered.length} products in catalog</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-12"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] && (
                        <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-cream-200" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 truncate">{product.name}</p>
                        <p className="text-xs text-muted">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600 hidden md:table-cell">{product.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{formatPrice(product.discount_price ?? product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${stockColors[product.stock_status]}`}>{product.stock_status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`chip ${product.is_published ? 'bg-success-50 text-success-600' : 'bg-cream-200 text-ink-500'}`}>
                      {product.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(product); setShowForm(true); }}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-cream-200 transition-colors text-ink-600"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => duplicateMutation.mutate(product)}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-cream-200 transition-colors text-ink-600"
                        aria-label="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"?`)) deleteMutation.mutate(product.id);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-error-50 hover:text-error-600 transition-colors text-ink-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Package className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                    <p className="text-muted">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            product={editing}
            categories={categories ?? []}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
              queryClient.invalidateQueries({ queryKey: ['products'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const isEditing = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    price: product?.price ?? 0,
    discount_price: product?.discount_price ?? '',
    sku: product?.sku ?? '',
    stock_status: product?.stock_status ?? 'in_stock',
    stock_quantity: product?.stock_quantity ?? 0,
    images: product?.images.join('\n') ?? '',
    ingredients: product?.ingredients ?? '',
    nutritional_info: product?.nutritional_info ?? '',
    allergen_info: product?.allergen_info ?? '',
    tags: product?.tags.join(', ') ?? '',
    is_featured: product?.is_featured ?? false,
    is_popular: product?.is_popular ?? false,
    is_new: product?.is_new ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    is_published: product?.is_published ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
      const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const payload = {
        name: form.name,
        slug,
        description: form.description || null,
        category_id: form.category_id || null,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        sku: form.sku || null,
        stock_status: form.stock_status,
        stock_quantity: Number(form.stock_quantity),
        images,
        ingredients: form.ingredients || null,
        nutritional_info: form.nutritional_info || null,
        allergen_info: form.allergen_info || null,
        tags,
        is_featured: form.is_featured,
        is_popular: form.is_popular,
        is_new: form.is_new,
        is_best_seller: form.is_best_seller,
        is_published: form.is_published,
      };

      if (isEditing && product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
        toast('Product updated');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast('Product created');
      }
      onSaved();
    } catch (err) {
      toast('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-cream rounded-2xl shadow-lift w-full max-w-2xl my-8 pointer-events-auto"
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white rounded-t-2xl">
              <h2 className="font-heading text-xl font-semibold text-ink-900">
                {isEditing ? 'Edit Product' : 'New Product'}
              </h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Product Name *</label>
                  <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Slug (optional)</label>
                  <input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-20" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">SKU</label>
                  <input className="input" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Price (Rs.) *</label>
                  <input type="number" step="0.01" className="input" required value={form.price} onChange={(e) => set('price', e.target.value)} />
                </div>
                <div>
                  <label className="label">Discount Price</label>
                  <input type="number" step="0.01" className="input" value={form.discount_price} onChange={(e) => set('discount_price', e.target.value)} />
                </div>
                <div>
                  <label className="label">Stock Qty</label>
                  <input type="number" className="input" value={form.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Stock Status</label>
                <select className="input" value={form.stock_status} onChange={(e) => set('stock_status', e.target.value)}>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="preorder">Pre-Order</option>
                </select>
              </div>
              <div>
                <label className="label">Image URLs (one per line)</label>
                <textarea className="input min-h-24" placeholder="https://..." value={form.images} onChange={(e) => set('images', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ingredients</label>
                  <input className="input" value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
                </div>
                <div>
                  <label className="label">Allergen Info</label>
                  <input className="input" value={form.allergen_info} onChange={(e) => set('allergen_info', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'is_featured', label: 'Featured' },
                  { key: 'is_popular', label: 'Popular' },
                  { key: 'is_new', label: 'New' },
                  { key: 'is_best_seller', label: 'Best Seller' },
                  { key: 'is_published', label: 'Published' },
                ].map((cb) => (
                  <label key={cb.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-cream-400 text-primary focus:ring-primary/20"
                      checked={form[cb.key as keyof typeof form] as boolean}
                      onChange={(e) => set(cb.key, e.target.checked)}
                    />
                    {cb.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-cream-300 bg-white rounded-b-2xl">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Product')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
