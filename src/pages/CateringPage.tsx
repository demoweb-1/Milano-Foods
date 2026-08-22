import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Utensils, CheckCircle2, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';

const cateringSchema = z.object({
  customer_name: z.string().min(2, 'Please enter your name'),
  customer_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  customer_phone: z.string().min(10, 'Enter a valid phone number'),
  organization: z.string().optional(),
  event_type: z.string().min(1, 'Please select an event type'),
  event_date: z.string().optional(),
  guest_count: z.string().optional(),
  service_type: z.string().min(1, 'Please select a service type'),
  menu_preferences: z.string().optional(),
  budget: z.string().optional(),
  special_instructions: z.string().optional(),
});

type CateringFormValues = z.infer<typeof cateringSchema>;

const eventTypes = ['Wedding', 'Corporate Event', 'Birthday Party', 'Religious Function', 'Family Gathering', 'Other'];
const serviceTypes = ['Full Catering', 'Buffet', 'Dessert Only', 'Custom Menu'];

export function CateringPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CateringFormValues>({ resolver: zodResolver(cateringSchema) });

  const onSubmit = async (data: CateringFormValues) => {
    try {
      const { error } = await supabase.from('catering_requests').insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone,
        organization: data.organization || null,
        event_type: data.event_type,
        event_date: data.event_date || null,
        guest_count: data.guest_count ? Number(data.guest_count) : null,
        service_type: data.service_type,
        menu_preferences: data.menu_preferences || null,
        budget: data.budget || null,
        special_instructions: data.special_instructions || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast('Catering inquiry submitted! We will be in touch soon.');
      reset();
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <>
      <div className="relative bg-ink-900 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/9738993/pexels-photo-9738993.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600"
            alt="Catering"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent" />
        </div>
        <div className="container-x relative">
          <div className="max-w-2xl">
            <span className="section-eyebrow text-gold">
              <Utensils className="h-4 w-4" /> Catering
            </span>
            <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
              Catering for every occasion
            </h1>
            <p className="mt-4 text-cream-200 text-lg max-w-xl">
              Weddings, corporate events, religious functions and family gatherings —
              let us handle the food while you enjoy the moment.
            </p>
          </div>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x max-w-3xl">
          {submitted ? (
            <Reveal>
              <div className="card p-10 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600 mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-ink-900">
                  Inquiry received!
                </h2>
                <p className="mt-3 text-ink-600 max-w-md mx-auto">
                  Thank you for your catering inquiry. Our team will prepare a custom menu and
                  quote, and contact you within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-outline mt-6">
                  Submit another inquiry
                </button>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-ink-900 mb-1">
                    Catering Inquiry
                  </h2>
                  <p className="text-sm text-muted">
                    Tell us about your event and we'll craft the perfect menu.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your Name" error={errors.customer_name?.message}>
                    <input className="input" placeholder="John Doe" {...register('customer_name')} />
                  </Field>
                  <Field label="Phone Number" error={errors.customer_phone?.message}>
                    <input className="input" placeholder="+94 77 123 4567" {...register('customer_phone')} />
                  </Field>
                  <Field label="Email (optional)" error={errors.customer_email?.message}>
                    <input className="input" placeholder="you@email.com" {...register('customer_email')} />
                  </Field>
                  <Field label="Organization (optional)">
                    <input className="input" placeholder="Company or family name" {...register('organization')} />
                  </Field>
                  <Field label="Event Type" error={errors.event_type?.message}>
                    <select className="input" {...register('event_type')}>
                      <option value="">Select event type</option>
                      {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Service Type" error={errors.service_type?.message}>
                    <select className="input" {...register('service_type')}>
                      <option value="">Select service type</option>
                      {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Event Date (optional)">
                    <input type="date" className="input" {...register('event_date')} />
                  </Field>
                  <Field label="Guest Count (optional)" error={errors.guest_count?.message}>
                    <input type="number" className="input" placeholder="e.g. 100" {...register('guest_count')} />
                  </Field>
                </div>

                <Field label="Budget Range (optional)">
                  <input className="input" placeholder="e.g. Rs. 50,000 – 100,000" {...register('budget')} />
                </Field>
                <Field label="Menu Preferences (optional)">
                  <textarea className="input min-h-20" placeholder="Any specific dishes, dietary requirements..." {...register('menu_preferences')} />
                </Field>
                <Field label="Special Instructions (optional)">
                  <textarea className="input min-h-24" placeholder="Anything else we should know..." {...register('special_instructions')} />
                </Field>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4">
                  {isSubmitting ? (
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Utensils className="h-5 w-5" /> Submit Catering Inquiry
                    </>
                  )}
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </Section>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
}
