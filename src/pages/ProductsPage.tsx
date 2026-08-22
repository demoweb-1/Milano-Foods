import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid3x3, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, useCategories, useSettings } from '@/lib/queries';
import { ProductCard } from '@/components/ui/ProductCard';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { Section } from '@/components/ui/Section';
import type { Product, StockStatus } from '@/types';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'name', label: 'Alphabetical' },
];

export function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';
  const inStockOnly = searchParams.get('in_stock') === 'true';

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const priceRanges = [
    { label: 'Under Rs. 500', min: 0, max: 500 },
    { label: 'Rs. 500 – 1,500', min: 500, max: 1500 },
    { label: 'Rs. 1,500 – 3,000', min: 1500, max: 3000 },
    { label: 'Above Rs. 3,000', min: 3000, max: Infinity },
  ];
  const priceRange = searchParams.get('price') ?? '';

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (categorySlug) {
      result = result.filter((p) => p.category?.slug === categorySlug);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.stock_status !== 'out_of_stock');
    }
    if (priceRange) {
      const range = priceRanges.find((r) => r.label === priceRange);
      if (range) {
        result = result.filter((p) => {
          const price = p.discount_price ?? p.price;
          return price >= range.min && price < range.max;
        });
      }
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'newest':
        result.sort((a, b) => Number(b.is_new) - Number(a.is_new));
        break;
      case 'popular':
        result.sort((a, b) => Number(b.is_popular) - Number(a.is_popular));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return result;
  }, [products, search, categorySlug, sort, inStockOnly, priceRange]);

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  return (
    <>
      {/* Page header */}
      <div className="bg-ink-900 text-white py-12 lg:py-16">
        <div className="container-x">
          <nav className="text-sm text-cream-300 mb-3">
            <span>Home</span> <span className="text-cream-400">/</span>{' '}
            <span className="text-white">Products</span>
            {activeCategory && (
              <>
                <span className="text-cream-400">/</span> <span className="text-gold">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-white">
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
          <p className="mt-3 text-cream-300 text-lg max-w-2xl">
            {activeCategory?.description ??
              'Browse our full selection of fresh bread, cakes, pastries, sweets, meals and more.'}
          </p>
        </div>
      </div>

      <Section className="bg-cream py-10 lg:py-14">
        <div className="container-x">
          {/* Search + sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                value={search}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder="Search products..."
                className="input pl-12"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="btn-outline lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="input sm:w-auto cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_1fr] gap-8">
            {/* Filters sidebar */}
            <aside className="hidden lg:block">
              <FilterContent
                categories={categories}
                categorySlug={categorySlug}
                updateParam={updateParam}
                priceRange={priceRange}
                priceRanges={priceRanges}
                inStockOnly={inStockOnly}
              />
            </aside>

            {/* Mobile filter drawer */}
            <AnimatePresence>
              {showFilters && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowFilters(false)}
                    className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm lg:hidden"
                  />
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed left-0 top-0 z-50 h-full w-72 bg-cream shadow-lift p-5 overflow-y-auto lg:hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-heading text-lg font-semibold">Filters</h3>
                      <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-200">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <FilterContent
                      categories={categories}
                      categorySlug={categorySlug}
                      updateParam={updateParam}
                      priceRange={priceRange}
                      priceRanges={priceRanges}
                      inStockOnly={inStockOnly}
                    />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Products grid */}
            <div>
              <p className="text-sm text-muted mb-5">
                {isLoading
                  ? 'Loading products...'
                  : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
              </p>
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-cream-200 mx-auto mb-4">
                    <Search className="h-8 w-8 text-ink-300" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-ink-900">No products found</h3>
                  <p className="text-muted mt-2 text-sm">Try adjusting your search or filters.</p>
                  <button
                    onClick={() => setSearchParams(new URLSearchParams())}
                    className="btn-outline mt-5"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                  {filtered.map((product, i) => (
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
          </div>
        </div>
      </Section>

      <QuickViewModal
        product={quickViewProduct}
        settings={settings}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}

function FilterContent({
  categories,
  categorySlug,
  updateParam,
  priceRange,
  priceRanges,
  inStockOnly,
}: {
  categories: ReturnType<typeof useCategories>['data'];
  categorySlug: string;
  updateParam: (key: string, value: string | null) => void;
  priceRange: string;
  priceRanges: { label: string; min: number; max: number }[];
  inStockOnly: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-base font-semibold text-ink-900 mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', null)}
            className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              !categorySlug ? 'bg-primary text-white' : 'text-ink-700 hover:bg-cream-200'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                categorySlug === cat.slug ? 'bg-primary text-white' : 'text-ink-700 hover:bg-cream-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-base font-semibold text-ink-900 mb-3">Price Range</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('price', null)}
            className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
              !priceRange ? 'bg-primary text-white' : 'text-ink-700 hover:bg-cream-200'
            }`}
          >
            Any Price
          </button>
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => updateParam('price', range.label)}
              className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                priceRange === range.label ? 'bg-primary text-white' : 'text-ink-700 hover:bg-cream-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-base font-semibold text-ink-900 mb-3">Availability</h3>
        <label className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-cream-200 transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
            className="h-4 w-4 rounded border-cream-400 text-primary focus:ring-primary/20"
          />
          <span className="text-ink-700">In stock only</span>
        </label>
      </div>
    </div>
  );
}
