import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime, timeAgo } from '@/lib/format';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order, ContactMessage, CakeRequest, Product } from '@/types';

export function AdminDashboardPage() {
  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Order[];
    },
    refetchInterval: 30000,
  });

  const { data: messages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const { data: cakeRequests } = useQuery({
    queryKey: ['admin-cake-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cake_requests')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as CakeRequest[];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders?.filter((o) => o.created_at.startsWith(today)) ?? [];
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length ?? 0;
  const lowStock = products?.filter((p) => p.stock_status === 'low_stock' || p.stock_status === 'out_of_stock') ?? [];

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length.toString(),
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
      change: '+12%',
    },
    {
      label: "Today's Revenue",
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      color: 'bg-success-50 text-success-600',
      change: '+8%',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Clock,
      color: 'bg-warning-50 text-warning-600',
      change: 'Action needed',
    },
    {
      label: 'Unread Messages',
      value: (messages?.length ?? 0).toString(),
      icon: MessageSquare,
      color: 'bg-gold/20 text-gold-700',
      change: 'New',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-warning-50 text-warning-600',
    accepted: 'bg-blue-50 text-blue-600',
    preparing: 'bg-gold/20 text-gold-700',
    ready: 'bg-success-50 text-success-600',
    completed: 'bg-cream-200 text-ink-600',
    cancelled: 'bg-error-50 text-error-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Welcome back! Here's what's happening at Milano Foods today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 shadow-soft border border-cream-200"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5.5 w-5.5" />
              </div>
              <span className="text-xs font-medium text-muted flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {stat.change}
              </span>
            </div>
            <p className="font-heading text-2xl font-bold text-ink-900 mt-3">{stat.value}</p>
            <p className="text-sm text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-cream-200">
            <h2 className="font-heading text-lg font-semibold text-ink-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:text-primary-700 flex items-center gap-1">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted">No orders yet</td>
                  </tr>
                )}
                {orders?.map((order) => (
                  <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{order.order_number}</td>
                    <td className="px-5 py-3.5 text-ink-600">{order.customer_name}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-900">{formatPrice(Number(order.total))}</td>
                    <td className="px-5 py-3.5">
                      <span className={`chip ${statusColors[order.status] ?? statusColors.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">{timeAgo(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Messages */}
          <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-cream-200">
              <h2 className="font-heading text-lg font-semibold text-ink-900">Messages</h2>
              <Link to="/admin/messages" className="text-sm text-primary hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {messages?.length === 0 && (
                <p className="text-sm text-muted text-center py-6">No new messages</p>
              )}
              {messages?.map((msg) => (
                <Link
                  key={msg.id}
                  to="/admin/messages"
                  className="block rounded-xl p-3 hover:bg-cream-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-900">{msg.name}</span>
                    <span className="text-xs text-muted">{timeAgo(msg.created_at)}</span>
                  </div>
                  <p className="text-xs text-ink-500 mt-1 line-clamp-2">{msg.message}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock alert */}
          <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-cream-200">
              <AlertCircle className="h-5 w-5 text-warning-600" />
              <h2 className="font-heading text-lg font-semibold text-ink-900">Stock Alerts</h2>
            </div>
            <div className="p-3 space-y-2">
              {lowStock.length === 0 && (
                <p className="text-sm text-muted text-center py-6">All products well stocked</p>
              )}
              {lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-cream-100 transition-colors">
                  <span className="text-sm font-medium text-ink-900">{product.name}</span>
                  <span className={`chip ${product.stock_status === 'out_of_stock' ? 'bg-error-50 text-error-600' : 'bg-warning-50 text-warning-600'}`}>
                    {product.stock_status === 'out_of_stock' ? 'Out' : 'Low'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cake requests */}
      {cakeRequests && cakeRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-cream-200">
            <h2 className="font-heading text-lg font-semibold text-ink-900">New Cake Requests</h2>
            <Link to="/admin/cake-requests" className="text-sm text-primary hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-cream-100">
            {cakeRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 hover:bg-cream-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-ink-900">{req.customer_name} — {req.cake_type ?? 'Custom Cake'}</p>
                  <p className="text-xs text-muted">{req.customer_phone} · {req.size ?? 'N/A'} · {req.flavour ?? 'N/A'}</p>
                </div>
                <span className="text-xs text-muted">{formatDateTime(req.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
