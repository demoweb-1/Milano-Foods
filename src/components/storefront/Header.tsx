import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight, Phone } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useSettings } from '@/lib/queries';
import { Logo } from './Logo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Custom Cakes', to: '/custom-cakes' },
  { label: 'Catering', to: '/catering' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Branches', to: '/branches' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

export function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-smooth ${
          scrolled ? 'glass shadow-soft' : 'bg-cream/95 backdrop-blur-sm'
        }`}
      >
        <div className="container-x">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Milano Foods home">
              <Logo className="h-9 lg:h-10 w-auto" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-ink-700 hover:text-primary hover:bg-cream-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-cream-200 transition-colors"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                to="/wishlist"
                className="hidden sm:grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-cream-200 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 grid h-4.5 min-w-4.5 px-1 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={onCartOpen}
                className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-cream-200 transition-colors relative"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute top-1 right-1 grid h-4.5 min-w-4.5 px-1 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white animate-scale-in">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-cream-200 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSearch}
                className="overflow-hidden lg:hidden"
              >
                <div className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for cakes, bread, pastries..."
                      className="input pl-12"
                    />
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="hidden lg:block">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <div className="relative max-w-xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for cakes, bread, pastries..."
                        className="input pl-12"
                      />
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {settings?.phone && scrolled === false && (
          <div className="hidden lg:block border-t border-cream-300 bg-cream-100/60">
            <div className="container-x flex items-center justify-center gap-2 py-1.5 text-xs text-ink-500">
              <Phone className="h-3.5 w-3.5" />
              <span>Call us: {settings.phone}</span>
              <span className="text-cream-400">•</span>
              <span>Free delivery on orders above Rs. 3,000 within Akurana</span>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm bg-cream shadow-lift lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-cream-300">
                <Logo className="h-8 w-auto" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-ink-800 hover:bg-cream-200'
                        }`
                      }
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </NavLink>
                  ))}
                </div>
              </nav>
              <div className="border-t border-cream-300 p-5 space-y-3">
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="btn-outline w-full">
                  <Heart className="h-4 w-4" /> Wishlist ({wishlistCount})
                </Link>
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} className="btn-secondary w-full">
                    <Phone className="h-4 w-4" /> {settings.phone}
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
