import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Cake, Trash2, Phone, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CakeRequest } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  reviewing: 'bg-blue-50 text-blue-600',
  quoted: 'bg-gold/20 text-gold-700',
  accepted: 'bg-success-50 text-success-600',
  completed: 'bg-cream-200 text-ink-600',
  cancelled: 'bg-error-50 text-error-600',
};
const statusOptions = ['new', 'reviewing', 'quoted', 'accepted', 'completed', 'cancelled'];

export function AdminCakeRequestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<CakeRequest | null>(null);

  const { data: requests } = useQuery({
    queryKey: ['admin-cake-requests-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cake_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CakeRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('cake_requests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cake-requests-all'] });
      toast('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cake_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cake-requests-all'] });
      toast('Request deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Cake Requests</h1>
        <p className="text-sm text-muted mt-1">{requests?.length ?? 0} total requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests?.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl shadow-soft border border-cream-200 p-5 cursor-pointer hover:shadow-lift transition-shadow"
            onClick={() => setSelected(req)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Cake className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-medium text-ink-900 text-sm">{req.customer_name}</p>
                  <p className="text-xs text-muted">{req.cake_type ?? 'Custom Cake'}</p>
                </div>
              </div>
              <select
                value={req.status}
                onChange={(e) => { e.stopPropagation(); updateStatus.mutate({ id: req.id, status: e.target.value }); }}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${statusColors[req.status]}`}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted">
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {req.customer_phone}</p>
              {req.size && <p>Size: {req.size}</p>}
              {req.flavour && <p>Flavour: {req.flavour}</p>}
              {req.collection_date && <p>Date: {req.collection_date}</p>}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-100">
              <span className="text-xs text-muted">{formatDateTime(req.created_at)}</span>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setSelected(req); }} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-cream-200 text-ink-600 transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this request?')) deleteMutation.mutate(req.id); }}
                  className="grid h-7 w-7 place-items-center rounded-lg hover:bg-error-50 hover:text-error-600 text-ink-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests?.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-cream-200">
            <Cake className="h-10 w-10 text-ink-300 mx-auto mb-3" />
            <p className="text-muted">No cake requests yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm" />
            <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="bg-cream rounded-2xl shadow-lift w-full max-w-lg my-8 pointer-events-auto">
                <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white rounded-t-2xl">
                  <h2 className="font-heading text-lg font-semibold text-ink-900">Cake Request Details</h2>
                  <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  {[
                    ['Customer', selected.customer_name],
                    ['Phone', selected.customer_phone],
                    ['Email', selected.customer_email ?? '—'],
                    ['Cake Type', selected.cake_type ?? '—'],
                    ['Size', selected.size ?? '—'],
                    ['Flavour', selected.flavour ?? '—'],
                    ['Layers', selected.layers ?? '—'],
                    ['Frosting', selected.frosting ?? '—'],
                    ['Colours', selected.colors ?? '—'],
                    ['Cake Message', selected.cake_message ?? '—'],
                    ['Collection Date', selected.collection_date ?? '—'],
                    ['Fulfillment', selected.fulfillment],
                    ['Delivery Address', selected.delivery_address ?? '—'],
                    ['Special Instructions', selected.special_instructions ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-cream-100 pb-2">
                      <span className="text-muted shrink-0">{label}</span>
                      <span className="text-ink-900 text-right">{value}</span>
                    </div>
                  ))}
                  {selected.inspiration_image_url && (
                    <div>
                      <p className="text-muted text-xs mb-2">Inspiration Image</p>
                      <img src={selected.inspiration_image_url} alt="Inspiration" className="w-full rounded-xl" />
                    </div>
                  )}
                  <p className="text-xs text-muted pt-2">{formatDateTime(selected.created_at)}</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
