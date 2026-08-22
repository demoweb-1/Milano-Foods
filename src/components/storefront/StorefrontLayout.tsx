import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export function StorefrontLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  if (typeof window !== 'undefined') {
    window.onscroll = () => {
      setShowTop(window.scrollY > 600);
    };
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <ScrollToTop />
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-white shadow-lift hover:bg-primary transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
