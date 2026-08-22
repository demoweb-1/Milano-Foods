import type { Product, Settings } from '@/types';
import { Heart, Eye, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/format';

type ProductCardProps = {
  product: Product;
  settings?: Settings | null;
  onQuickView?: (product: Product) => void;
  index?: number;
};

export function ProductCard({ product, settings, onQuickView, index = 0 }: ProductCardProps) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const isWishlisted = has(product.id);

  const image = product.images[0] ?? '';
  const hasDiscount = product.discount_price != null && product.discount_price > 0;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;

  const badgeLabels: Record<string, string> = {
    'best-seller': 'Best Seller',
    popular: 'Popular',
    new: 'New',
    featured: 'Featured',
  };
  const topBadge = product.badges.find((b) => badgeLabels[b]);

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_status === 'out_of_stock') return;
    add({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image,
      quantity: 1,
    });
    toast(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="group card overflow-hidden flex flex-col h-full hover:shadow-lift hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {topBadge && (
              <span className="chip bg-primary text-white shadow-soft">{badgeLabels[topBadge]}</span>
            )}
            {hasDiscount && (
              <span className="chip bg-gold text-ink-900 shadow-soft">
                {Math.round((1 - product.discount_price! / product.price) * 100)}% Off
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur text-ink-700 hover:text-primary hover:bg-white shadow-soft transition-colors"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur text-ink-700 hover:text-primary hover:bg-white shadow-soft transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              {product.category?.name ?? 'Bakery'}
            </span>
            <span className={`chip ${stockColor[product.stock_status]}`}>
              {stockLabel[product.stock_status]}
            </span>
          </div>
          <h3 className="font-heading text-lg font-semibold text-ink-900 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm text-ink-500 line-clamp-2 flex-1">
            {product.description}
          </p>

          <div className="flex items-center gap-1 mt-3">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <Star className="h-4 w-4 fill-gold text-gold" />
            <Star className="h-4 w-4 fill-gold text-gold" />
            <Star className="h-4 w-4 fill-gold text-gold" />
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-xs text-muted ml-1">5.0</span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-semibold text-ink-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock_status === 'out_of_stock'}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white hover:bg-primary active:scale-90 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
