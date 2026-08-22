import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { useWishlist } from '@/lib/wishlist-context';
import { useProducts, useSettings } from '@/lib/queries';
import { ProductCard } from '@/components/ui/ProductCard';
import { useState } from 'react';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import type { Product } from '@/types';

export function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const { data: products } = useProducts();
  const { data: settings } = useSettings();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const wishlistProducts = products?.filter((p) => ids.includes(p.id)) ?? [];

  return (
    <Section className="bg-cream min-h-[60vh]">
      <div className="container-x">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <h1 className="font-heading text-3xl font-semibold text-ink-900">My Wishlist</h1>
          <span className="chip bg-cream-200 text-ink-600">{wishlistProducts.length} items</span>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200 mx-auto mb-5">
              <Heart className="h-9 w-9 text-ink-300" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-ink-900">Your wishlist is empty</h3>
            <p className="text-muted mt-2 text-sm">Save your favourite products for later.</p>
            <Link to="/products" className="btn-primary mt-6">
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {wishlistProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onQuickView={setQuickViewProduct}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <QuickViewModal product={quickViewProduct} settings={settings} onClose={() => setQuickViewProduct(null)} />
    </Section>
  );
}
