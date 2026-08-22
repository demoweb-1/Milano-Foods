import { Link } from 'react-router-dom';
import { Home, ArrowLeft, ChefHat } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block">
          <ChefHat className="h-24 w-24 text-primary mx-auto" />
          <span className="absolute -top-2 -right-2 grid h-10 w-10 place-items-center rounded-full bg-gold text-ink-900 font-heading font-bold text-sm">
            404
          </span>
        </div>
        <h1 className="font-heading text-4xl font-semibold text-ink-900 mt-6">
          This page is overbaked
        </h1>
        <p className="mt-3 text-ink-500">
          The page you're looking for has been moved or no longer exists. Let's get you back to something fresh.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link to="/products" className="btn-outline">
            <ArrowLeft className="h-4 w-4" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
