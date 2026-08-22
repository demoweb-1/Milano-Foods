import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Utensils, Trash2, Phone, Users, Calendar } from 'lucide-react';
import type { CateringRequest } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  reviewing: 'bg-blue-50 text-blue-600',
  quoted: 'bg-gold/20 text-gold-700',
  confirmed: 'bg-success-50 text-success-600',
  completed: 'bg-cream-200 text-ink-600',
  cancelled: 'bg-error-50 text-error-600',
};
const statusOptions = ['new', 'reviewing', 'quoted', 'confirmed', 'completed', 'cancelled'];

export function AdminCateringPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests } = useQuery({
    queryKey: ['admin-catering-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catering_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CateringRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('catering_requests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catering-all'] });
      toast('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('catering_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catering-all'] });
      toast('Request deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Catering Requests</h1>
        <p className="text-sm text-muted mt-1">{requests?.length ?? 0} total inquiries</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests?.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl shadow-soft border border-cream-200 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-success-50 text-success-600">
                  <Utensils className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-medium text-ink-900 text-sm">{req.customer_name}</p>
                  <p className="text-xs text-muted">{req.event_type ?? 'Event'}</p>
                </div>
              </div>
              <select
                value={req.status}
                onChange={(e) => updateStatus.mutate({ id: req.id, status: e.target.value })}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${statusColors[req.status]}`}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted">
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {req.customer_phone}</p>
              {req.event_date && <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {req.event_date}</p>}
              {req.guest_count && <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {req.guest_count} guests</p>}
              {req.service_type && <p>Service: {req.service_type}</p>}
              {req.budget && <p>Budget: {req.budget}</p>}
            </div>
            {req.menu_preferences && (
              <p className="text-xs text-ink-500 mt-2 line-clamp-2">{req.menu_preferences}</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-100">
              <span className="text-xs text-muted">{formatDateTime(req.created_at)}</span>
              <button
                onClick={() => { if (confirm('Delete this inquiry?')) deleteMutation.mutate(req.id); }}
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-error-50 hover:text-error-600 text-ink-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {requests?.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-cream-200">
            <Utensils className="h-10 w-10 text-ink-300 mx-auto mb-3" />
            <p className="text-muted">No catering requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
