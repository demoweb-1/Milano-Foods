import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, CheckCircle2, ArrowRight, Truck, Store, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useSettings, useBranches } from '@/lib/queries';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/format';
import { Section } from '@/components/ui/Section';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Please enter your name'),
  customer_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  customer_phone: z.string().min(10, 'Enter a valid phone number'),
  fulfillment: z.enum(['delivery', 'pickup']),
  delivery_address: z.string().optional(),
  branch_id: z.string().optional(),
  notes: z.string().optional(),
  coupon_code: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useSettings();
  const { data: branches } = useBranches();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fulfillment: 'delivery' },
  });

  const fulfillment = watch('fulfillment');
  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const deliveryFee = fulfillment === 'delivery' ? (settings?.delivery_charge ?? 250) : 0;
  const total = subtotal - discount + deliveryFee;

  const handleApplyCoupon = () => {
    if (!appliedCoupon) return;
    if (appliedCoupon.toUpperCase() === 'MILANO10') {
      setDiscount(subtotal * 0.1);
      toast('Coupon applied! 10% discount', 'success');
    } else {
      toast('Invalid coupon code', 'error');
      setDiscount(0);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const ordNum = generateOrderNumber();
      const { error } = await supabase.from('orders').insert({
        order_number: ordNum,
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone,
        fulfillment: data.fulfillment,
        delivery_address: data.delivery_address || null,
        branch_id: data.branch_id || null,
        line_items: items,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total,
        coupon_code: appliedCoupon || null,
        notes: data.notes || null,
        status: 'pending',
      });
      if (error) throw error;
      setOrderNumber(ordNum);
      setSubmitted(true);
      clear();
      toast('Order placed successfully!');
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    }
  };

  if (submitted) {
    return (
      <Section className="bg-cream min-h-[70vh] flex items-center">
        <div className="container-x max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-10 text-center"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600 mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-3xl font-semibold text-ink-900">Order placed!</h1>
            <p className="mt-3 text-ink-600">
              Thank you for your order. We've received your request and will contact you shortly to confirm.
            </p>
            <div className="mt-6 rounded-xl bg-cream-100 p-4">
              <p className="text-sm text-muted">Your order number</p>
              <p className="font-heading text-2xl font-bold text-primary mt-1">{orderNumber}</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="btn-primary">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
              <button onClick={() => navigate('/')} className="btn-outline">Back to Home</button>
            </div>
          </motion.div>
        </div>
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section className="bg-cream min-h-[60vh] flex items-center">
        <div className="container-x max-w-md text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200 mx-auto mb-5">
            <ShoppingBag className="h-9 w-9 text-ink-300" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-ink-900">Your cart is empty</h1>
          <p className="text-muted mt-2">Add some products before checking out.</p>
          <Link to="/products" className="btn-primary mt-6">Browse Products <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Section>
    );
  }

  return (
    <Section className="bg-cream">
      <div className="container-x">
        <h1 className="font-heading text-3xl font-semibold text-ink-900 mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Fulfillment */}
            <div className="card p-6">
              <h2 className="font-heading text-lg font-semibold text-ink-900 mb-4">Collection Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${fulfillment === 'delivery' ? 'border-primary bg-primary/5' : 'border-cream-400 hover:border-cream-500'}`}>
                  <input type="radio" value="delivery" className="sr-only" {...register('fulfillment')} />
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="block font-medium text-ink-900 mt-2">Delivery</span>
                  <span className="text-xs text-muted">{formatPrice(settings?.delivery_charge ?? 250, symbol)} fee</span>
                </label>
                <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${fulfillment === 'pickup' ? 'border-primary bg-primary/5' : 'border-cream-400 hover:border-cream-500'}`}>
                  <input type="radio" value="pickup" className="sr-only" {...register('fulfillment')} />
                  <Store className="h-5 w-5 text-primary" />
                  <span className="block font-medium text-ink-900 mt-2">Pickup</span>
                  <span className="text-xs text-muted">Free — collect from branch</span>
                </label>
              </div>
            </div>

            {/* Contact details */}
            <div className="card p-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold text-ink-900">Your Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="John Doe" {...register('customer_name')} />
                  {errors.customer_name && <p className="mt-1 text-xs text-error-500">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input className="input" placeholder="+94 77 123 4567" {...register('customer_phone')} />
                  {errors.customer_phone && <p className="mt-1 text-xs text-error-500">{errors.customer_phone.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input className="input" placeholder="you@email.com" {...register('customer_email')} />
              </div>
            </div>

            {/* Delivery / Pickup details */}
            {fulfillment === 'delivery' ? (
              <div className="card p-6">
                <h2 className="font-heading text-lg font-semibold text-ink-900 mb-4">Delivery Address</h2>
                <textarea className="input min-h-24" placeholder="Your full delivery address" {...register('delivery_address')} />
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="font-heading text-lg font-semibold text-ink-900 mb-4">Pickup Branch</h2>
                <select className="input" {...register('branch_id')}>
                  <option value="">Select a branch</option>
                  {branches?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.address}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-heading text-lg font-semibold text-ink-900 mb-4">Order Notes (optional)</h2>
              <textarea className="input min-h-20" placeholder="Any special instructions..." {...register('notes')} />
            </div>
          </form>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card p-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold text-ink-900">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    className="input pl-9 py-2.5 text-sm"
                    placeholder="Coupon code"
                    value={appliedCoupon}
                    onChange={(e) => setAppliedCoupon(e.target.value)}
                  />
                </div>
                <button type="button" onClick={handleApplyCoupon} className="btn-outline px-4 py-2.5 text-sm">
                  Apply
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product_id}
                      layout
                      className="flex gap-3 items-center"
                    >
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-cream-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{item.name}</p>
                        <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.price, symbol)}</p>
                      </div>
                      <span className="text-sm font-semibold text-ink-900">
                        {formatPrice(item.price * item.quantity, symbol)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Totals */}
              <div className="border-t border-cream-300 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, symbol)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount, symbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-600">
                  <span>Delivery</span>
                  <span className="font-medium">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee, symbol)}</span>
                </div>
                <div className="flex justify-between text-lg font-heading font-semibold text-ink-900 pt-2 border-t border-cream-300">
                  <span>Total</span>
                  <span>{formatPrice(total, symbol)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn-primary w-full text-base py-4"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Place Order <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
              <p className="text-xs text-muted text-center">
                We'll confirm your order by phone before processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
