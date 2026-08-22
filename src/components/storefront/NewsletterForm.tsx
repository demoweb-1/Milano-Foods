import { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

export function NewsletterForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });
      if (error) {
        if (error.code === '23505') {
          toast('You are already subscribed!', 'info');
        } else {
          throw error;
        }
      } else {
        setDone(true);
        toast('Subscribed successfully! Welcome to Milano Foods.');
      }
      setEmail('');
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
          variant === 'dark' ? 'bg-white/10 text-white' : 'bg-success-50 text-success-700'
        }`}
      >
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <p className="text-sm font-medium">Thank you for subscribing! Check your inbox soon.</p>
      </div>
    );
  }

  const isDark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md w-full">
      <div className="relative flex-1">
        <Mail
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
            isDark ? 'text-cream-300' : 'text-muted'
          }`}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`w-full rounded-full pl-12 pr-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            isDark
              ? 'bg-white/10 text-white placeholder:text-cream-300 border border-white/20 focus:border-primary'
              : 'bg-white border border-cream-400 text-ink-800 placeholder:text-muted focus:border-primary'
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary shrink-0"
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Subscribe <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
