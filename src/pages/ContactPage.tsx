import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Section, Reveal } from '@/components/ui/Section';
import { useSettings } from '@/lib/queries';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, 'Please enter your message'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const { error } = await supabase.from('contact_messages').insert({
        type: 'general',
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
      });
      if (error) throw error;
      setSubmitted(true);
      toast('Message sent! We will get back to you soon.');
      reset();
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <>
      <div className="bg-ink-900 text-white py-16 lg:py-20">
        <div className="container-x">
          <span className="section-eyebrow text-gold">Contact</span>
          <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
            Get in touch
          </h1>
          <p className="mt-3 text-cream-200 text-lg max-w-2xl">
            Questions, feedback or a special request? We'd love to hear from you.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            {/* Info */}
            <Reveal>
              <div className="space-y-4">
                <div className="card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-ink-900">Visit Us</h3>
                  <p className="text-sm text-ink-500 mt-1">{settings?.address ?? 'Akurana, Sri Lanka'}</p>
                </div>
                <div className="card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-ink-900">Call Us</h3>
                  <a href={`tel:${settings?.phone}`} className="text-sm text-ink-500 hover:text-primary transition-colors mt-1 block">
                    {settings?.phone}
                  </a>
                  {settings?.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-success-600 hover:underline mt-1 block"
                    >
                      WhatsApp: {settings.whatsapp}
                    </a>
                  )}
                </div>
                <div className="card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-ink-900">Email Us</h3>
                  <a href={`mailto:${settings?.email}`} className="text-sm text-ink-500 hover:text-primary transition-colors mt-1 block">
                    {settings?.email ?? 'info@milanofoods.lk'}
                  </a>
                </div>
                <div className="card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-ink-900">Opening Hours</h3>
                  <p className="text-sm text-ink-500 mt-1">Monday – Sunday</p>
                  <p className="text-sm text-ink-500">6:00 AM – 10:00 PM</p>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={0.1}>
              {submitted ? (
                <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600 mb-5">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold text-ink-900">Message sent!</h2>
                  <p className="mt-3 text-ink-600 max-w-sm">
                    Thank you for reaching out. Our team will respond within 24 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-outline mt-6">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-5">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold text-ink-900 mb-1">Send a message</h2>
                    <p className="text-sm text-muted">We typically respond within 24 hours.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input className="input" placeholder="John Doe" {...register('name')} />
                      {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input className="input" placeholder="you@email.com" {...register('email')} />
                      {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Phone (optional)</label>
                      <input className="input" placeholder="+94 77 123 4567" {...register('phone')} />
                    </div>
                    <div>
                      <label className="label">Subject (optional)</label>
                      <input className="input" placeholder="How can we help?" {...register('subject')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea className="input min-h-32" placeholder="Tell us what you need..." {...register('message')} />
                    {errors.message && <p className="mt-1 text-xs text-error-500">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4">
                    {isSubmitting ? (
                      <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
