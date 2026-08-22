import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Search, Eye, X, ShoppingCart, Phone, MapPin, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '@/types';

const statusOptions = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-warning-50 text-warning-600',
  accepted: 'bg-blue-50 text-blue-600',
  preparing: 'bg-gold/20 text-gold-700',
  ready: 'bg-success-50 text-success-600',
  completed: 'bg-cream-200 text-ink-600',
  cancelled: 'bg-error-50 text-error-600',
};

export function AdminOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast('Order status updated');
    },
    onError: () => toast('Failed to update order', 'error'),
  });

  const filtered = orders?.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Orders</h1>
        <p className="text-sm text-muted mt-1">{filtered.length} orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, phone..."
            className="input pl-12"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-auto cursor-pointer"
        >
          <option value="all">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink-900">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink-900">{order.customer_name}</p>
                    <p className="text-xs text-muted">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="chip bg-cream-200 text-ink-600 capitalize">{order.fulfillment}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">{formatPrice(Number(order.total))}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer capitalize ${statusColors[order.status]}`}
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs hidden sm:table-cell">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-cream-200 transition-colors text-ink-600 ml-auto"
                      aria-label="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingCart className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                    <p className="text-muted">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="bg-cream rounded-2xl shadow-lift w-full max-w-lg my-8 pointer-events-auto"
              >
                <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white rounded-t-2xl">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-ink-900">{selectedOrder.order_number}</h2>
                    <span className={`chip ${statusColors[selectedOrder.status]} mt-1`}>{selectedOrder.status}</span>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Customer</p>
                        <p className="text-sm font-medium text-ink-900">{selectedOrder.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Phone</p>
                        <p className="text-sm font-medium text-ink-900">{selectedOrder.customer_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Date</p>
                        <p className="text-sm font-medium text-ink-900">{formatDateTime(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Fulfillment</p>
                        <p className="text-sm font-medium text-ink-900 capitalize">{selectedOrder.fulfillment}</p>
                        {selectedOrder.delivery_address && (
                          <p className="text-xs text-ink-500 mt-0.5">{selectedOrder.delivery_address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="rounded-xl bg-cream-100 p-4">
                      <p className="text-xs text-muted">Order Notes</p>
                      <p className="text-sm text-ink-700 mt-1">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-ink-900 mb-3">Items</p>
                    <div className="space-y-2">
                      {selectedOrder.line_items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 border border-cream-200">
                          <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-cream-200" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate">{item.name}</p>
                            <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <span className="text-sm font-semibold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-cream-300 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-ink-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(Number(selectedOrder.subtotal))}</span>
                    </div>
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-success-600">
                        <span>Discount</span>
                        <span>-{formatPrice(Number(selectedOrder.discount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-ink-600">
                      <span>Delivery</span>
                      <span>{formatPrice(Number(selectedOrder.delivery_fee))}</span>
                    </div>
                    <div className="flex justify-between text-lg font-heading font-semibold text-ink-900 pt-2 border-t border-cream-200">
                      <span>Total</span>
                      <span>{formatPrice(Number(selectedOrder.total))}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
