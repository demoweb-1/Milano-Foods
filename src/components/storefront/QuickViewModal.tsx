import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Star, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product, Settings } from '@/types';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/format';

type QuickViewModalProps = {
  product: Product | null;
  settings?: Settings | null;
  onClose: () => void;
};

export function QuickViewModal({ product, settings, onClose }: QuickViewModalProps) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const isWishlisted = product ? has(product.id) : false;
  const hasDiscount = product?.discount_price != null && product.discount_price > 0;
  const displayPrice = hasDiscount ? product!.discount_price! : product?.price ?? 0;

  const handleAdd = () => {
    if (!product || product.stock_status === 'out_of_stock') return;
    add({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: product.images[0] ?? '',
      quantity: qty,
    });
    toast(`${product.name} added to cart`);
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-cream rounded-3xl shadow-lift w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative bg-cream-200 p-6 md:p-8">
                  <img
                    src={product.images[activeImage] ?? product.images[0]}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                  {product.images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            i === activeImage ? 'border-primary' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 md:p-8 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-muted uppercase tracking-wide">
                        {product.category?.name ?? 'Bakery'}
                      </span>
                      <h2 className="font-heading text-2xl font-semibold text-ink-900 mt-1">
                        {product.name}
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200 transition-colors shrink-0"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                    <span className="text-xs text-muted ml-1">5.0 (based on reviews)</span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="font-heading text-3xl font-bold text-ink-900">
                      {formatPrice(displayPrice, symbol)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-muted line-through">
                        {formatPrice(product.price, symbol)}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-ink-600 text-sm leading-relaxed">
                    {product.description}
                  </p>

                  {product.ingredients && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-800">
                        Ingredients
                      </p>
                      <p className="text-sm text-ink-600 mt-1">{product.ingredients}</p>
                    </div>
                  )}
                  {product.allergen_info && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-800">
                        Allergens
                      </p>
                      <p className="text-sm text-ink-600 mt-1">{product.allergen_info}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-6 space-y-3">
                    {product.stock_status !== 'out_of_stock' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-ink-700">Quantity</span>
                        <div className="flex items-center gap-1 rounded-full border border-cream-400 bg-white">
                          <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{qty}</span>
                          <button
                            onClick={() => setQty((q) => q + 1)}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleAdd}
                        disabled={product.stock_status === 'out_of_stock'}
                        className="btn-primary flex-1 disabled:opacity-40"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {product.stock_status === 'out_of_stock' ? 'Sold Out' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={() => {
                          toggle(product.id);
                          toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                        }}
                        className="grid h-12 w-12 place-items-center rounded-full border border-cream-400 hover:border-primary transition-colors"
                        aria-label="Toggle wishlist"
                      >
                        <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                      </button>
                    </div>
                    <Link
                      to={`/products/${product.slug}`}
                      onClick={onClose}
                      className="block text-center text-sm text-primary hover:text-primary-700 font-medium transition-colors"
                    >
                      View full details →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
