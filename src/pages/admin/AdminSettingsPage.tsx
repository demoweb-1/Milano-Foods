import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Save, Store, Globe, Sliders } from 'lucide-react';
import type { Settings } from '@/types';

export function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Partial<Settings>>({});

  const current = { ...settings, ...form } as Partial<Settings>;
  const set = (key: keyof Settings, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').update({
        business_name: current.business_name,
        tagline: current.tagline,
        description: current.description,
        address: current.address,
        phone: current.phone,
        whatsapp: current.whatsapp,
        email: current.email,
        google_maps_url: current.google_maps_url,
        instagram_url: current.instagram_url,
        facebook_url: current.facebook_url,
        youtube_url: current.youtube_url,
        currency: current.currency,
        currency_symbol: current.currency_symbol,
        delivery_charge: current.delivery_charge,
        average_rating: current.average_rating,
        review_count: current.review_count,
        trust_since: current.trust_since,
        enable_delivery: current.enable_delivery,
        enable_pickup: current.enable_pickup,
        enable_ordering: current.enable_ordering,
        newsletter_enabled: current.newsletter_enabled,
        seo_title: current.seo_title,
        seo_description: current.seo_description,
      }).eq('id', 1);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast('Settings saved');
      setForm({});
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-muted text-center py-20">Loading settings...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your bakery information and preferences</p>
      </div>

      {/* Business info */}
      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-ink-900">Business Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Business Name</label>
            <input className="input" value={current.business_name ?? ''} onChange={(e) => set('business_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="input" value={current.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-16" value={current.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={current.address ?? ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={current.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" value={current.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={current.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Google Maps URL</label>
            <input className="input" value={current.google_maps_url ?? ''} onChange={(e) => set('google_maps_url', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-ink-900">Social Links</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Instagram URL</label>
            <input className="input" value={current.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} />
          </div>
          <div>
            <label className="label">Facebook URL</label>
            <input className="input" value={current.facebook_url ?? ''} onChange={(e) => set('facebook_url', e.target.value)} />
          </div>
          <div>
            <label className="label">YouTube URL</label>
            <input className="input" value={current.youtube_url ?? ''} onChange={(e) => set('youtube_url', e.target.value)} />
          </div>
        </div>
      </div>

      {/* System */}
      <div className="bg-white rounded-2xl shadow-soft border border-cream-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sliders className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-ink-900">System</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Currency</label>
            <input className="input" value={current.currency ?? ''} onChange={(e) => set('currency', e.target.value)} />
          </div>
          <div>
            <label className="label">Currency Symbol</label>
            <input className="input" value={current.currency_symbol ?? ''} onChange={(e) => set('currency_symbol', e.target.value)} />
          </div>
          <div>
            <label className="label">Delivery Charge</label>
            <input type="number" className="input" value={current.delivery_charge ?? 0} onChange={(e) => set('delivery_charge', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Trust Since (Year)</label>
            <input type="number" className="input" value={current.trust_since ?? 1998} onChange={(e) => set('trust_since', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Average Rating</label>
            <input type="number" step="0.01" className="input" value={current.average_rating ?? 4.8} onChange={(e) => set('average_rating', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Review Count</label>
            <input type="number" className="input" value={current.review_count ?? 1000} onChange={(e) => set('review_count', Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[
            { key: 'enable_delivery', label: 'Enable Delivery' },
            { key: 'enable_pickup', label: 'Enable Pickup' },
            { key: 'enable_ordering', label: 'Enable Online Ordering' },
            { key: 'newsletter_enabled', label: 'Enable Newsletter' },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-cream-400 text-primary"
                checked={current[toggle.key as keyof Settings] as boolean}
                onChange={(e) => set(toggle.key as keyof Settings, e.target.checked)}
              />
              {toggle.label}
            </label>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 bg-white rounded-2xl shadow-lift border border-cream-200 p-4 flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="h-4 w-4" /> Save Settings</>}
        </button>
      </div>
    </form>
  );
}
