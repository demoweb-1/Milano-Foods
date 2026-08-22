import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Cake,
  Utensils,
  FileText,
  Image as ImageIcon,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/storefront/Logo';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
  { label: 'Cake Requests', to: '/admin/cake-requests', icon: Cake },
  { label: 'Catering', to: '/admin/catering', icon: Utensils },
  { label: 'Blog', to: '/admin/blog', icon: FileText },
  { label: 'Gallery', to: '/admin/gallery', icon: ImageIcon },
  { label: 'Categories', to: '/admin/categories', icon: Tag },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-cream-300">
        <div className="bg-ink-900 rounded-xl px-3 py-2 inline-block">
          <Logo className="h-7 w-auto" />
        </div>
        <p className="text-xs text-muted mt-2 ml-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-ink-700 hover:bg-cream-200'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-cream-300 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200 transition-colors"
        >
          <ExternalLink className="h-4.5 w-4.5" /> View Website
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-cream-300 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lift flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-cream-300">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-cream-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted">
              <Search className="h-4 w-4" />
              <span>Search products, orders...</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-cream-200 transition-colors" aria-label="Notifications">
                <Bell className="h-5 w-5 text-ink-700" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white text-sm font-semibold">
                  {session.user.email?.charAt(0).toUpperCase() ?? 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-ink-900">Admin</p>
                  <p className="text-xs text-muted truncate max-w-[160px]">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
