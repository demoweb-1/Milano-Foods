import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/queries';
import { formatPrice } from '@/lib/format';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, updateQty, remove, count } = useCart();
  const { data: settings } = useSettings();
  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const freeDeliveryThreshold = 3000;
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[60] h-full w-full max-w-md bg-cream shadow-lift flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-cream-300 bg-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold text-ink-900">
                  Your Cart ({count})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200 mb-5">
                  <ShoppingBag className="h-9 w-9 text-ink-300" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-ink-900">Your cart is empty</h3>
                <p className="mt-2 text-sm text-muted max-w-xs">
                  Browse our fresh selection of cakes, bread and pastries to get started.
                </p>
                <Link to="/products" onClick={onClose} className="btn-primary mt-6">
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Free delivery progress */}
                <div className="px-5 py-3 bg-white border-b border-cream-300">
                  {remaining > 0 ? (
                    <p className="text-xs text-ink-600 mb-2">
                      Add <span className="font-semibold text-primary">{formatPrice(remaining, symbol)}</span> more for free delivery
                    </p>
                  ) : (
                    <p className="text-xs text-success-600 font-medium mb-2">
                      You qualify for free delivery!
                    </p>
                  )}
                  <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.product_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3.5 bg-white rounded-2xl p-3 shadow-soft"
                    >
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={onClose}
                        className="shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover bg-cream-200"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={onClose}
                          className="font-medium text-ink-900 text-sm leading-snug hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {formatPrice(item.price, symbol)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-cream-400 bg-cream-100">
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity - 1)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-cream-300 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity + 1)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-cream-300 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.product_id)}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-error hover:bg-error-50 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-cream-300 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">Subtotal</span>
                    <span className="font-heading text-xl font-semibold text-ink-900">
                      {formatPrice(subtotal, symbol)}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Delivery and taxes calculated at checkout.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="btn-ghost w-full"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
