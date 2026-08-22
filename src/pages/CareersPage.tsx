import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, CheckCircle2, Send, MapPin, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Section, Reveal } from '@/components/ui/Section';

const careerSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  position_applied: z.string().min(2, 'Please enter the position'),
  message: z.string().min(10, 'Tell us a bit about yourself'),
});

type CareerFormValues = z.infer<typeof careerSchema>;

const openings = [
  { title: 'Master Baker', type: 'Full-time', location: 'Akurana', desc: 'Lead our daily bread and pastry production with 5+ years of baking experience.' },
  { title: 'Cake Decorator', type: 'Full-time', location: 'Akurana', desc: 'Create stunning custom cakes for weddings, birthdays and celebrations.' },
  { title: 'Restaurant Chef', type: 'Full-time', location: 'Kandy', desc: 'Prepare our restaurant menu — fried rice, curries and Sri Lankan favourites.' },
  { title: 'Customer Service Associate', type: 'Full-time', location: 'Akurana', desc: 'Be the welcoming face of Milano Foods at our main branch.' },
];

export function CareersPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CareerFormValues>({ resolver: zodResolver(careerSchema) });

  const onSubmit = async (data: CareerFormValues) => {
    try {
      const { error } = await supabase.from('contact_messages').insert({
        type: 'career',
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        position_applied: data.position_applied,
      });
      if (error) throw error;
      setSubmitted(true);
      toast('Application submitted! We will be in touch.');
      reset();
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <>
      <div className="bg-ink-900 text-white py-16 lg:py-20">
        <div className="container-x">
          <span className="section-eyebrow text-gold">Careers</span>
          <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
            Join the Milano family
          </h1>
          <p className="mt-3 text-cream-200 text-lg max-w-2xl">
            We're always looking for passionate people who love baking and serving our community.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x">
          {/* Openings */}
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {openings.map((job, i) => (
              <Reveal key={job.title} delay={i * 0.06}>
                <div className="card p-6 h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-ink-900">{job.title}</h3>
                    </div>
                    <span className="chip bg-success-50 text-success-600 shrink-0">{job.type}</span>
                  </div>
                  <p className="text-sm text-ink-500 mt-2 leading-relaxed">{job.desc}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Application form */}
          {submitted ? (
            <Reveal>
              <div className="card p-10 text-center max-w-lg mx-auto">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600 mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-ink-900">Application received!</h2>
                <p className="mt-3 text-ink-600">
                  Thank you for your interest in joining Milano Foods. We'll review your application and get back to you.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-outline mt-6">
                  Submit another application
                </button>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h2 className="font-heading text-2xl font-semibold text-ink-900">Apply Now</h2>
                  <p className="text-sm text-muted mt-1">Tell us about yourself and why you'd be a great fit.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="John Doe" {...register('name')} />
                    {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input className="input" placeholder="+94 77 123 4567" {...register('phone')} />
                    {errors.phone && <p className="mt-1 text-xs text-error-500">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <input className="input" placeholder="you@email.com" {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Position Applied For *</label>
                    <input className="input" placeholder="e.g. Master Baker" {...register('position_applied')} />
                    {errors.position_applied && <p className="mt-1 text-xs text-error-500">{errors.position_applied.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Tell us about yourself *</label>
                  <textarea className="input min-h-32" placeholder="Your experience, why you want to join, and what makes you a great fit..." {...register('message')} />
                  {errors.message && <p className="mt-1 text-xs text-error-500">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4">
                  {isSubmitting ? (
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Submit Application
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
