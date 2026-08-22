import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';
import { useGallery } from '@/lib/queries';

export function GalleryPage() {
  const { data: items } = useGallery();
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(items?.map((i) => i.category).filter(Boolean) as string[]);
    return ['All', ...Array.from(cats)];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items ?? [];
    return items?.filter((i) => i.category === activeCategory) ?? [];
  }, [items, activeCategory]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  };
  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  };

  return (
    <>
      <div className="bg-ink-900 text-white py-16 lg:py-20">
        <div className="container-x">
          <span className="section-eyebrow text-gold">Gallery</span>
          <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
            A glimpse inside our world
          </h1>
          <p className="mt-3 text-cream-200 text-lg max-w-2xl">
            The craft, the colours and the moments that make Milano Foods special.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white text-ink-700 hover:bg-cream-200 border border-cream-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={Math.min(i * 0.04, 0.3)}>
                <button
                  onClick={() => openLightbox(i)}
                  className="group relative block w-full overflow-hidden rounded-2xl shadow-card break-inside-avoid"
                >
                  <img
                    src={item.image_url}
                    alt={item.alt_text ?? item.title ?? ''}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {item.title && (
                    <span className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="block text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.title}
                      </span>
                    </span>
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 z-[80] bg-ink-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <button
                onClick={closeLightbox}
                className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="max-w-4xl max-h-[85vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filtered[lightboxIndex].image_url}
                  alt={filtered[lightboxIndex].alt_text ?? ''}
                  className="max-h-[78vh] rounded-2xl object-contain"
                />
                {filtered[lightboxIndex].title && (
                  <p className="mt-4 text-white text-center font-heading text-lg">
                    {filtered[lightboxIndex].title}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
