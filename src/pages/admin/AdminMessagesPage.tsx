import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Search, Mail, Phone, Trash2, MailOpen, Archive, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContactMessage } from '@/types';

const typeColors: Record<string, string> = {
  general: 'bg-blue-50 text-blue-600',
  cake: 'bg-primary/10 text-primary',
  corporate: 'bg-gold/20 text-gold-700',
  catering: 'bg-success-50 text-success-600',
  career: 'bg-purple-50 text-purple-600',
  newsletter: 'bg-cream-200 text-ink-600',
};

export function AdminMessagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data: messages } = useQuery({
    queryKey: ['admin-messages-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages-all'] }),
  });

  const updateReplyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ reply_status: status, is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages-all'] });
      toast('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages-all'] });
      toast('Message deleted');
    },
  });

  const filtered = messages?.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  }) ?? [];

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) markRead.mutate(msg.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Messages</h1>
        <p className="text-sm text-muted mt-1">
          {messages?.filter((m) => !m.is_read).length ?? 0} unread · {filtered.length} total
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="input pl-12"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input sm:w-auto cursor-pointer">
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="cake">Cake</option>
          <option value="corporate">Corporate</option>
          <option value="catering">Catering</option>
          <option value="career">Career</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 overflow-hidden">
        <div className="divide-y divide-cream-100">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              className="flex items-center gap-4 p-4 hover:bg-cream-50 transition-colors cursor-pointer"
            >
              <div className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold shrink-0 ${msg.is_read ? 'bg-cream-200 text-ink-500' : 'bg-primary text-white'}`}>
                {msg.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${msg.is_read ? 'font-medium text-ink-700' : 'font-semibold text-ink-900'}`}>
                    {msg.name}
                  </p>
                  {!msg.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted truncate mt-0.5">{msg.message}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                <span className={`chip ${typeColors[msg.type] ?? typeColors.general} capitalize`}>{msg.type}</span>
                <span className="text-xs text-muted">{formatDateTime(msg.created_at)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Mail className="h-10 w-10 text-ink-300 mx-auto mb-3" />
              <p className="text-muted">No messages found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
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
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white font-semibold">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-semibold text-ink-900">{selected.name}</h2>
                      <span className={`chip ${typeColors[selected.type] ?? typeColors.general} capitalize mt-0.5`}>{selected.type}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-ink-600 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" /> {selected.email}
                    </a>
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-ink-600 hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" /> {selected.phone}
                      </a>
                    )}
                  </div>
                  {selected.position_applied && (
                    <div className="rounded-xl bg-cream-100 p-3">
                      <p className="text-xs text-muted">Position Applied</p>
                      <p className="text-sm font-medium text-ink-900">{selected.position_applied}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted mb-1">Message</p>
                    <p className="text-sm text-ink-700 leading-relaxed rounded-xl bg-white p-4 border border-cream-200">
                      {selected.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{formatDateTime(selected.created_at)}</span>
                    <span>·</span>
                    <span className="capitalize">Reply status: {selected.reply_status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-300">
                    <button onClick={() => updateReplyStatus.mutate({ id: selected.id, status: 'replied' })} className="btn-primary text-sm px-4 py-2">
                      <MailOpen className="h-4 w-4" /> Mark Replied
                    </button>
                    <button onClick={() => updateReplyStatus.mutate({ id: selected.id, status: 'archived' })} className="btn-ghost text-sm px-4 py-2">
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this message?')) {
                          deleteMutation.mutate(selected.id);
                          setSelected(null);
                        }
                      }}
                      className="btn-ghost text-sm px-4 py-2 text-error-600 hover:bg-error-50 ml-auto"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
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
