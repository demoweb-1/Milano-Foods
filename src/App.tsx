import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const BranchesPage = lazy(() => import('@/pages/BranchesPage').then((m) => ({ default: m.BranchesPage })));
const BlogListPage = lazy(() => import('@/pages/BlogListPage').then((m) => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const CustomCakesPage = lazy(() => import('@/pages/CustomCakesPage').then((m) => ({ default: m.CustomCakesPage })));
const CateringPage = lazy(() => import('@/pages/CateringPage').then((m) => ({ default: m.CateringPage })));
const CareersPage = lazy(() => import('@/pages/CareersPage').then((m) => ({ default: m.CareersPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })));
const AdminCakeRequestsPage = lazy(() => import('@/pages/admin/AdminCakeRequestsPage').then((m) => ({ default: m.AdminCakeRequestsPage })));
const AdminCateringPage = lazy(() => import('@/pages/admin/AdminCateringPage').then((m) => ({ default: m.AdminCateringPage })));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage').then((m) => ({ default: m.AdminBlogPage })));
const AdminGalleryPage = lazy(() => import('@/pages/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              <HashRouter>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    {/* Storefront */}
                    <Route element={<StorefrontLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:slug" element={<ProductDetailPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/gallery" element={<GalleryPage />} />
                      <Route path="/branches" element={<BranchesPage />} />
                      <Route path="/blog" element={<BlogListPage />} />
                      <Route path="/blog/:slug" element={<BlogDetailPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/custom-cakes" element={<CustomCakesPage />} />
                      <Route path="/catering" element={<CateringPage />} />
                      <Route path="/careers" element={<CareersPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Admin */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="messages" element={<AdminMessagesPage />} />
                      <Route path="cake-requests" element={<AdminCakeRequestsPage />} />
                      <Route path="catering" element={<AdminCateringPage />} />
                      <Route path="blog" element={<AdminBlogPage />} />
                      <Route path="gallery" element={<AdminGalleryPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </HashRouter>
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
