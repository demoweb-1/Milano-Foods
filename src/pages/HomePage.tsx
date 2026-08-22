import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  ChefHat,
  HeartHandshake,
  Truck,
  MapPin,
  Phone,
  ArrowUpRight,
  Quote,
  Cake,
  Utensils,
} from 'lucide-react';
import {
  useProducts,
  useCategories,
  useFreshBake,
  useReviews,
  useSettings,
  useBlogPosts,
  useGallery,
  useBranches,
} from '@/lib/queries';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';
import { ProductCard } from '@/components/ui/ProductCard';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { formatPrice, formatDate } from '@/lib/format';
import { NewsletterForm } from '@/components/storefront/NewsletterForm';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

export function HomePage() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: freshBake } = useFreshBake();
  const { data: reviews } = useReviews();
  const { data: settings } = useSettings();
  const { data: blogPosts } = useBlogPosts();
  const { data: gallery } = useGallery();
  const { data: branches } = useBranches();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const featuredProducts = products?.filter((p) => p.is_featured).slice(0, 8) ?? [];
  const symbol = settings?.currency_symbol ?? 'Rs. ';
  const avgRating = settings?.average_rating ?? 4.8;
  const reviewCount = settings?.review_count ?? 1000;
  const trustSince = settings?.trust_since ?? 1998;
  const yearsOfTrust = new Date().getFullYear() - trustSince;

  return (
    <>
      {/* ===== HERO ===== */}
      <Hero settings={settings} avgRating={avgRating} reviewCount={reviewCount} yearsOfTrust={yearsOfTrust} />

      {/* ===== TODAY'S FRESH BAKE ===== */}
      <Section className="bg-white">
        <div className="container-x">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Fresh Today"
              title="Today's Fresh Bake"
              subtitle="Baked this morning. Available while stocks last — these go fast."
            />
            <span className="inline-flex items-center gap-2 chip bg-success-50 text-success-600 self-start sm:self-end">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
              </span>
              Live — updated daily
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
            {freshBake?.slice(0, 5).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <div className="card overflow-hidden group h-full">
                  <div className="relative aspect-square overflow-hidden bg-cream-200">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <AvailabilityChip status={item.availability} />
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-heading text-sm sm:text-base font-semibold text-ink-900 leading-snug">
                      {item.name}
                    </h3>
                    {item.stock_note && (
                      <p className="text-xs text-muted mt-1">{item.stock_note}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <Section className="bg-cream-100">
        <div className="container-x">
          <SectionHeader
            center
            eyebrow="Explore"
            title="Browse by Category"
            subtitle="From daily bread to celebration cakes — find exactly what you're craving."
          />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {categories?.slice(0, 8).map((cat, i) => (
              <Reveal key={cat.id} delay={i * 0.05}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group relative block rounded-2xl overflow-hidden aspect-[4/5] shadow-card hover:shadow-lift transition-all duration-300"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-cream-200 mt-1 line-clamp-1 opacity-90">
                      {cat.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white group-hover:text-gold transition-colors">
                      Explore <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <Section className="bg-white">
        <div className="container-x">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Most Loved"
              title="Featured Products"
              subtitle="Our customers' favourites — handpicked for their quality and taste."
            />
            <Link to="/products" className="btn-outline self-start sm:self-end">
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onQuickView={setQuickViewProduct}
                index={i}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ===== CUSTOM CAKES ===== */}
      <CustomCakesSection />

      {/* ===== WHY CHOOSE ===== */}
      <WhyChooseSection yearsOfTrust={yearsOfTrust} />

      {/* ===== OUR STORY ===== */}
      <OurStorySection />

      {/* ===== REVIEWS ===== */}
      <ReviewsSection reviews={reviews} avgRating={avgRating} reviewCount={reviewCount} />

      {/* ===== GALLERY ===== */}
      <Section className="bg-cream-100">
        <div className="container-x">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Gallery"
              title="A Glimpse Inside"
              subtitle="The craft, the colours and the moments that make Milano Foods special."
            />
            <Link to="/gallery" className="btn-outline self-start sm:self-end">
              View Full Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {gallery?.slice(0, 8).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.04}>
                <Link
                  to="/gallery"
                  className={`group relative block overflow-hidden rounded-2xl shadow-card ${
                    i === 0 || i === 5 ? 'row-span-2 aspect-[1/2]' : 'aspect-square'
                  }`}
                >
                  <img
                    src={item.image_url}
                    alt={item.alt_text ?? item.title ?? ''}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/30 transition-colors duration-300" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== BLOG ===== */}
      {blogPosts && blogPosts.length > 0 && (
        <Section className="bg-white">
          <div className="container-x">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <SectionHeader
                eyebrow="Journal"
                title="Latest Articles"
                subtitle="Recipes, baking tips and festive inspiration from our kitchen."
              />
              <Link to="/blog" className="btn-outline self-start sm:self-end">
                Read All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group card overflow-hidden h-full flex flex-col hover:shadow-lift hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {post.category && (
                        <span className="absolute top-3 left-3 chip bg-white/90 backdrop-blur text-ink-800 text-xs">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs text-muted">
                        {post.published_at ? formatDate(post.published_at) : ''}
                      </p>
                      <h3 className="font-heading text-lg font-semibold text-ink-900 mt-2 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-ink-500 mt-2 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ===== BRANCHES ===== */}
      <BranchesSection branches={branches} settings={settings} />

      {/* ===== NEWSLETTER ===== */}
      <Section className="bg-ink-900 text-white">
        <div className="container-x">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <Sparkles className="h-10 w-10 text-gold mx-auto mb-4" />
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white">
                Never miss a fresh batch
              </h2>
              <p className="mt-3 text-cream-300 text-lg">
                Subscribe for festive offers, new arrivals and exclusive deals — delivered to your inbox.
              </p>
              <div className="mt-8 flex justify-center">
                <NewsletterForm />
              </div>
            </Reveal>
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

function AvailabilityChip({ status }: { status: 'available' | 'limited' | 'sold_out' }) {
  const map = {
    available: { label: 'Available', class: 'bg-success-50 text-success-600' },
    limited: { label: 'Limited', class: 'bg-warning-50 text-warning-600' },
    sold_out: { label: 'Sold Out', class: 'bg-error-50 text-error-600' },
  };
  const cfg = map[status];
  return (
    <span className={`chip ${cfg.class} shadow-soft`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

function Hero({
  settings,
  avgRating,
  reviewCount,
  yearsOfTrust,
}: {
  settings: ReturnType<typeof useSettings>['data'];
  avgRating: number;
  reviewCount: number;
  yearsOfTrust: number;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const heroImage = 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1600';

  return (
    <section className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-ink-900">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Milano Foods bakery interior"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/70 to-ink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
      </div>

      <div className="container-x relative z-10 py-20 lg:py-0">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 chip bg-white/10 backdrop-blur border border-white/20 text-white"
          >
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-medium">{avgRating} / 5</span>
            <span className="opacity-70">•</span>
            <span className="opacity-90">{reviewCount.toLocaleString()}+ Google Reviews</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl sm:text-5xl lg:text-display-xl text-white font-semibold mt-5 leading-[1.05] text-balance"
          >
            Akurana's most
            <br />
            <span className="text-gold">trusted bakery</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-lg text-cream-200 leading-relaxed max-w-xl"
          >
            Fresh bread, premium cakes, traditional sweets and restaurant meals —
            crafted with {yearsOfTrust}+ years of passion and the finest ingredients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/products" className="btn-primary text-base px-7 py-3.5">
              Order Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/custom-cakes"
              className="btn bg-white/10 backdrop-blur border border-white/30 text-white px-7 py-3.5 hover:bg-white/20 active:scale-[0.98]"
            >
              <Cake className="h-5 w-5" /> Custom Cakes
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-cream-300 text-sm"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-gold" />
              <span>Open daily 6 AM – 10 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-gold" />
              <span>Delivery & Pickup</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-2 text-cream-300">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

function CustomCakesSection() {
  const cakeTypes = [
    { name: 'Birthday', image: 'https://images.pexels.com/photos/9475871/pexels-photo-9475871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Wedding', image: 'https://images.pexels.com/photos/30233124/pexels-photo-30233124.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Anniversary', image: 'https://images.pexels.com/photos/1682472/pexels-photo-1682472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Corporate', image: 'https://images.pexels.com/photos/14457392/pexels-photo-14457392.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
    { name: 'Baby Shower', image: 'https://images.pexels.com/photos/32125117/pexels-photo-32125117.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  ];

  return (
    <Section className="relative overflow-hidden bg-ink-900 text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="container-x relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeader
              eyebrow="Custom Cakes"
              title="Cakes designed for your moments"
              subtitle="From elegant wedding tiers to playful birthday creations — our master bakers bring your vision to life with premium ingredients and meticulous craftsmanship."
            />
            <div className="mt-8 space-y-3">
              {[
                'Choose your size, flavour, layers and frosting',
                'Upload an inspiration image for reference',
                'Add a personal cake message',
                'Select delivery or pickup on your date',
              ].map((feature, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-ink-900 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-cream-200">{feature}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Link to="/custom-cakes" className="btn-gold mt-8">
              Request Custom Cake <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
            {cakeTypes.map((type, i) => (
              <Reveal key={type.name} delay={i * 0.08}>
                <Link
                  to="/custom-cakes"
                  className={`group relative block overflow-hidden rounded-2xl ${
                    i === 0 ? 'col-span-2 aspect-[2/1] sm:col-span-1 sm:aspect-square' : 'aspect-square'
                  }`}
                >
                  <img
                    src={type.image}
                    alt={type.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-heading text-base font-semibold text-white">
                    {type.name}
                  </span>
                  <ArrowUpRight className="absolute top-3 right-3 h-5 w-5 text-white/70 group-hover:text-gold transition-colors" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function WhyChooseSection({ yearsOfTrust }: { yearsOfTrust: number }) {
  const features = [
    { icon: Sparkles, title: 'Fresh Ingredients', desc: 'We source premium ingredients daily for maximum freshness.' },
    { icon: ChefHat, title: 'Expert Bakers', desc: 'Our master bakers bring decades of craft to every bake.' },
    { icon: ShieldCheck, title: `Trusted Since`, titleSuffix: yearsOfTrust, desc: 'Over a thousand 5-star Google reviews from happy customers.' },
    { icon: Award, title: 'Premium Quality', desc: 'Every product meets our strict quality standards.' },
    { icon: Truck, title: 'Fast Service', desc: 'Quick delivery within Akurana and ready pickup at branches.' },
    { icon: HeartHandshake, title: 'Friendly Staff', desc: 'Warm, helpful service that keeps customers coming back.' },
  ];

  return (
    <Section className="bg-cream">
      <div className="container-x">
        <SectionHeader
          center
          eyebrow="Why Milano"
          title="Why customers choose us"
          subtitle="We don't just bake — we craft experiences that bring people together."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="card p-6 h-full hover:shadow-lift hover:-translate-y-1 group">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-ink-900 mt-4">
                  {f.title}{f.titleSuffix ? ` ${f.titleSuffix}+ Years` : ''}
                </h3>
                <p className="text-sm text-ink-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function OurStorySection() {
  return (
    <Section className="bg-white">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lift">
                <img
                  src="https://images.pexels.com/photos/7447284/pexels-photo-7447284.jpeg?auto=compress&cs=tinysrgb&h=900&w=720"
                  alt="Milano Foods baker"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-white rounded-2xl p-6 shadow-glow max-w-[200px]">
                <p className="font-heading text-4xl font-bold">27+</p>
                <p className="text-sm text-cream-100 mt-1">Years of baking tradition in Akurana</p>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeader
              eyebrow="Our Story"
              title="A legacy of craft and community"
              subtitle="What began as a small neighbourhood bakery has grown into Akurana's most loved name for fresh bread, cakes and sweets."
            />
            <div className="mt-6 space-y-4 text-ink-600 leading-relaxed">
              <p>
                For over two decades, Milano Foods has been a cornerstone of Akurana — a place where
                families come for their daily bread, where couples order their wedding cakes, and
                where every festive season is made sweeter.
              </p>
              <p>
                Our mission is simple: to craft the freshest, finest baked goods using quality
                ingredients and time-honoured techniques, while serving our community with warmth
                and care.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Years', value: '27+' },
                { label: 'Reviews', value: '1,000+' },
                { label: 'Products', value: '50+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center rounded-2xl bg-cream-100 p-4">
                  <p className="font-heading text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-outline mt-8">
              Read Our Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ReviewsSection({
  reviews,
  avgRating,
  reviewCount,
}: {
  reviews: ReturnType<typeof useReviews>['data'];
  avgRating: number;
  reviewCount: number;
}) {
  return (
    <Section className="bg-cream-100">
      <div className="container-x">
        <SectionHeader
          center
          eyebrow="Reviews"
          title="Loved by thousands"
          subtitle="Real reviews from our Google business profile. We're grateful for every one."
        />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-heading text-5xl font-bold text-ink-900">{avgRating}</p>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-gold text-gold" />
              ))}
            </div>
          </div>
          <div className="h-px sm:h-16 w-16 sm:w-px bg-cream-400" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-ink-900">{reviewCount.toLocaleString()}+</p>
            <p className="text-sm text-muted mt-1">Google Reviews</p>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {reviews?.slice(0, 3).map((review, i) => (
            <Reveal key={review.id} delay={i * 0.08}>
              <div className="card p-6 h-full flex flex-col">
                <Quote className="h-8 w-8 text-primary/20 shrink-0" />
                <p className="text-ink-700 mt-3 leading-relaxed flex-1">"{review.text}"</p>
                <div className="flex items-center gap-0.5 mt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-cream-300">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white font-heading font-semibold">
                    {review.author_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900 text-sm">{review.author_name}</p>
                    <p className="text-xs text-muted">Google Review</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://www.google.com/search?q=Milano+Foods+Akurana+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View All Google Reviews <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </Section>
  );
}

function BranchesSection({
  branches,
  settings,
}: {
  branches: ReturnType<typeof useBranches>['data'];
  settings: ReturnType<typeof useSettings>['data'];
}) {
  return (
    <Section className="bg-white">
      <div className="container-x">
        <SectionHeader
          center
          eyebrow="Visit Us"
          title="Find us nearby"
          subtitle="Come say hello at one of our branches. Fresh bakes waiting for you."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {branches?.map((branch, i) => (
            <Reveal key={branch.id} delay={i * 0.1}>
              <div className="card p-6 h-full flex flex-col sm:flex-row gap-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-semibold text-ink-900">{branch.name}</h3>
                    {branch.is_main && (
                      <span className="chip bg-gold/20 text-gold-700">Main Branch</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-600 mt-1.5">{branch.address}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    {branch.hours && (
                      <p className="flex items-center gap-2 text-ink-600">
                        <Clock className="h-4 w-4 text-muted" /> {branch.hours}
                      </p>
                    )}
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`} className="flex items-center gap-2 text-ink-600 hover:text-primary transition-colors">
                        <Phone className="h-4 w-4 text-muted" /> {branch.phone}
                      </a>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    {branch.map_url && (
                      <a
                        href={branch.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-sm px-4 py-2"
                      >
                        <MapPin className="h-4 w-4" /> Directions
                      </a>
                    )}
                    <Link to="/branches" className="btn-ghost text-sm px-4 py-2">
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
