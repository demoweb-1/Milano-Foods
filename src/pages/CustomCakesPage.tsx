import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cake, Calendar, Upload, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';
import { motion } from 'framer-motion';

const cakeSchema = z.object({
  customer_name: z.string().min(2, 'Please enter your name'),
  customer_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  customer_phone: z.string().min(10, 'Enter a valid phone number'),
  cake_type: z.string().min(1, 'Please select a cake type'),
  size: z.string().min(1, 'Please select a size'),
  flavour: z.string().min(1, 'Please select a flavour'),
  layers: z.string().min(1, 'Please select number of layers'),
  frosting: z.string().min(1, 'Please select a frosting'),
  colors: z.string().optional(),
  cake_message: z.string().optional(),
  collection_date: z.string().min(1, 'Please choose a date'),
  fulfillment: z.enum(['delivery', 'pickup']),
  delivery_address: z.string().optional(),
  special_instructions: z.string().optional(),
});

type CakeFormValues = z.infer<typeof cakeSchema>;

const cakeTypes = ['Birthday', 'Wedding', 'Anniversary', 'Corporate', 'Baby Shower', 'Graduation', 'Other'];
const sizes = ['Small (6")', 'Medium (8")', 'Large (10")', 'Extra Large (12")', 'Multi-tier'];
const flavours = ['Chocolate', 'Vanilla', 'Red Velvet', 'Strawberry', 'Caramel', 'Lemon', 'Custom'];
const layerOptions = ['Single Layer', 'Two Layers', 'Three Layers', 'Four+ Layers'];
const frostings = ['Buttercream', 'Cream Cheese', 'Fondant', 'Ganache', 'Whipped Cream'];

export function CustomCakesPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [inspirationUrl, setInspirationUrl] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CakeFormValues>({
    resolver: zodResolver(cakeSchema),
    defaultValues: { fulfillment: 'pickup' },
  });

  const fulfillment = watch('fulfillment');

  const onSubmit = async (data: CakeFormValues) => {
    try {
      const { error } = await supabase.from('cake_requests').insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone,
        cake_type: data.cake_type,
        size: data.size,
        flavour: data.flavour,
        layers: data.layers,
        frosting: data.frosting,
        colors: data.colors || null,
        cake_message: data.cake_message || null,
        inspiration_image_url: inspirationUrl || null,
        collection_date: data.collection_date,
        fulfillment: data.fulfillment,
        delivery_address: data.delivery_address || null,
        special_instructions: data.special_instructions || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast('Your cake request has been submitted! We will contact you soon.');
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
            src="https://images.pexels.com/photos/30233124/pexels-photo-30233124.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600"
            alt="Custom cakes"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent" />
        </div>
        <div className="container-x relative">
          <div className="max-w-2xl">
            <span className="section-eyebrow text-gold">
              <Sparkles className="h-4 w-4" /> Custom Cakes
            </span>
            <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
              A cake as unique as your celebration
            </h1>
            <p className="mt-4 text-cream-200 text-lg max-w-xl">
              From elegant wedding tiers to playful birthday creations — tell us your vision and our
              master bakers will craft it to perfection.
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
                  Request received!
                </h2>
                <p className="mt-3 text-ink-600 max-w-md mx-auto">
                  Thank you for your custom cake request. Our team will review your details and
                  contact you within 24 hours to confirm pricing and details.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline mt-6"
                >
                  Submit another request
                </button>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-ink-900 mb-1">
                    Tell us about your cake
                  </h2>
                  <p className="text-sm text-muted">
                    Fill in the details below and we'll get back to you with a quote.
                  </p>
                </div>

                {/* Contact */}
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
                  <Field label="Preferred Collection Date" error={errors.collection_date?.message}>
                    <input type="date" className="input" {...register('collection_date')} />
                  </Field>
                </div>

                {/* Cake details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Cake Type" error={errors.cake_type?.message}>
                    <select className="input" {...register('cake_type')}>
                      <option value="">Select type</option>
                      {cakeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Size" error={errors.size?.message}>
                    <select className="input" {...register('size')}>
                      <option value="">Select size</option>
                      {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Flavour" error={errors.flavour?.message}>
                    <select className="input" {...register('flavour')}>
                      <option value="">Select flavour</option>
                      {flavours.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Layers" error={errors.layers?.message}>
                    <select className="input" {...register('layers')}>
                      <option value="">Select layers</option>
                      {layerOptions.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Frosting" error={errors.frosting?.message}>
                    <select className="input" {...register('frosting')}>
                      <option value="">Select frosting</option>
                      {frostings.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Preferred Colours" >
                    <input className="input" placeholder="e.g. pink and gold" {...register('colors')} />
                  </Field>
                </div>

                <Field label="Cake Message (optional)">
                  <input className="input" placeholder="e.g. Happy 30th Birthday Sarah!" {...register('cake_message')} />
                </Field>

                <Field label="Inspiration Image URL (optional)">
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      className="input pl-12"
                      placeholder="Paste an image URL for reference"
                      value={inspirationUrl}
                      onChange={(e) => setInspirationUrl(e.target.value)}
                    />
                  </div>
                </Field>

                {/* Fulfillment */}
                <div>
                  <p className="label">Collection Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${fulfillment === 'pickup' ? 'border-primary bg-primary/5' : 'border-cream-400 hover:border-cream-500'}`}>
                      <input type="radio" value="pickup" className="sr-only" {...register('fulfillment')} />
                      <span className="font-medium text-ink-900">Pickup</span>
                      <p className="text-xs text-muted mt-1">Collect from our branch</p>
                    </label>
                    <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${fulfillment === 'delivery' ? 'border-primary bg-primary/5' : 'border-cream-400 hover:border-cream-500'}`}>
                      <input type="radio" value="delivery" className="sr-only" {...register('fulfillment')} />
                      <span className="font-medium text-ink-900">Delivery</span>
                      <p className="text-xs text-muted mt-1">We deliver to you</p>
                    </label>
                  </div>
                </div>

                {fulfillment === 'delivery' && (
                  <Field label="Delivery Address">
                    <textarea className="input min-h-20" placeholder="Your full delivery address" {...register('delivery_address')} />
                  </Field>
                )}

                <Field label="Special Instructions (optional)">
                  <textarea className="input min-h-24" placeholder="Any allergies, dietary requirements or specific design notes..." {...register('special_instructions')} />
                </Field>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4">
                  {isSubmitting ? (
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Cake className="h-5 w-5" /> Submit Cake Request
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
}
