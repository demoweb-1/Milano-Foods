import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSettings, useCategories } from '@/lib/queries';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();

  return (
    <footer className="bg-ink-900 text-cream-100">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="container-x py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-heading text-2xl sm:text-3xl text-white font-semibold">
                Join the Milano family
              </h3>
              <p className="mt-2 text-cream-300 text-sm sm:text-base max-w-md">
                Get festive offers, new product alerts and baking tips straight to your inbox.
              </p>
            </div>
            <NewsletterForm variant="dark" />
          </div>
        </div>
      </div>

      <div className="container-x py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl px-3 py-2 inline-block mb-4">
              <Logo className="h-8 w-auto" />
            </div>
            <p className="text-cream-300 text-sm leading-relaxed max-w-xs">
              Akurana's most trusted bakery since {settings?.trust_since ?? 1998}. Fresh bread,
              premium cakes, sweets, pastries, meals and catering — crafted with love every day.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Products', to: '/products' },
                { label: 'Custom Cakes', to: '/custom-cakes' },
                { label: 'Catering', to: '/catering' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Blog', to: '/blog' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-cream-300 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories?.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/products?category=${c.slug}`}
                    className="text-cream-300 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-base font-semibold text-white mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm text-cream-300">
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 mt-0.5 shrink-0 text-primary" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 shrink-0 text-primary" />
                  <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 shrink-0 text-primary" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.tagline && (
                <li className="flex items-start gap-3">
                  <Clock className="h-4.5 w-4.5 mt-0.5 shrink-0 text-primary" />
                  <span>Open daily 6:00 AM – 10:00 PM</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-400">
          <p>
            © {new Date().getFullYear()} {settings?.business_name ?? 'Milano Foods'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
