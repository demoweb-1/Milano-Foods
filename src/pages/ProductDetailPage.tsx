import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Minus,
  Plus,
  Star,
  Heart,
  ShoppingBag,
  ChevronRight,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { useProduct, useProducts, useSettings } from '@/lib/queries';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/ui/ProductCard';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { Section, Reveal } from '@/components/ui/Section';
import type { Product } from '@/types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug ?? '');
  const { data: allProducts } = useProducts();
  const { data: settings } = useSettings();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (!isLoading && !product) {
    return <Navigate to="/404" replace />;
  }

  if (isLoading || !product) {
    return (
      <div className="container-x py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-10 w-3/4 rounded-xl" />
            <div className="skeleton h-8 w-32 rounded-xl" />
            <div className="skeleton h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const hasDiscount = product.discount_price != null && product.discount_price > 0;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;
  const isWishlisted = has(product.id);

  const related = allProducts
    ?.filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4) ?? [];

  const stockColor: Record<string, string> = {
    in_stock: 'text-success-600 bg-success-50',
    low_stock: 'text-warning-600 bg-warning-50',
    out_of_stock: 'text-error-600 bg-error-50',
    preorder: 'text-gold-600 bg-gold-50',
  };
  const stockLabel: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Sold Out',
    preorder: 'Pre-Order',
  };

  const handleAdd = () => {
    if (product.stock_status === 'out_of_stock') return;
    add({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: product.images[0] ?? '',
      quantity: qty,
    });
    toast(`${product.name} added to cart`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard', 'info');
    }
  };

  return (
    <>
      <div className="bg-cream-100 py-8">
        <div className="container-x">
          <nav className="flex items-center gap-1.5 text-sm text-muted">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-4 w-4" />
            {product.category && (
              <>
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-ink-800 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <Section className="bg-cream-100 pt-8 pb-16 lg:pt-12">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="aspect-square rounded-3xl overflow-hidden bg-cream-200 shadow-card"
              >
                <img
                  src={product.images[activeImage] ?? product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImage ? 'border-primary shadow-soft' : 'border-cream-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wide">
                  {product.category?.name ?? 'Bakery'}
                </span>
                <span className={`chip ${stockColor[product.stock_status]}`}>
                  {stockLabel[product.stock_status]}
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ink-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-sm text-muted">5.0 (based on reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mt-5">
                <span className="font-heading text-4xl font-bold text-ink-900">
                  {formatPrice(displayPrice, symbol)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted line-through">
                      {formatPrice(product.price, symbol)}
                    </span>
                    <span className="chip bg-gold/20 text-gold-700">
                      Save {formatPrice(product.price - displayPrice, symbol)}
                    </span>
                  </>
                )}
              </div>

              <p className="mt-5 text-ink-600 leading-relaxed">{product.description}</p>

              {product.sku && (
                <p className="mt-3 text-xs text-muted">SKU: {product.sku}</p>
              )}

              {/* Quantity + add */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {product.stock_status !== 'out_of_stock' && (
                  <div className="flex items-center gap-1 rounded-full border border-cream-400 bg-white">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAdd}
                  disabled={product.stock_status === 'out_of_stock'}
                  className="btn-primary flex-1 min-w-[180px] disabled:opacity-40"
                >
                  <ShoppingBag className="h-5 w-5" />
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
                <button
                  onClick={handleShare}
                  className="grid h-12 w-12 place-items-center rounded-full border border-cream-400 hover:border-primary transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-7 grid grid-cols-3 gap-3 pt-6 border-t border-cream-300">
                {[
                  { icon: Truck, label: 'Fast Delivery' },
                  { icon: ShieldCheck, label: 'Premium Quality' },
                  { icon: RotateCcw, label: 'Fresh Daily' },
                ].map((b) => (
                  <div key={b.label} className="text-center">
                    <b.icon className="h-6 w-6 text-primary mx-auto" />
                    <p className="text-xs text-ink-600 mt-2">{b.label}</p>
                  </div>
                ))}
              </div>

              {/* Product info tabs */}
              <div className="mt-8 space-y-4">
                {product.ingredients && (
                  <DetailRow label="Ingredients" value={product.ingredients} />
                )}
                {product.nutritional_info && (
                  <DetailRow label="Nutritional Information" value={product.nutritional_info} />
                )}
                {product.allergen_info && (
                  <DetailRow label="Allergen Information" value={product.allergen_info} />
                )}
                {product.tags.length > 0 && (
                  <div className="pt-4 border-t border-cream-300">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-800 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span key={tag} className="chip bg-cream-200 text-ink-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Related products */}
      {related.length > 0 && (
        <Section className="bg-white py-14">
          <div className="container-x">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-ink-900 mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  settings={settings}
                  onQuickView={setQuickViewProduct}
                  index={i}
                />
              ))}
            </div>
          </div>
        </Section>
      )}

      <QuickViewModal
        product={quickViewProduct}
        settings={settings}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pt-4 border-t border-cream-300 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-800 mb-1.5">{label}</p>
      <p className="text-sm text-ink-600 leading-relaxed">{value}</p>
    </div>
  );
}
