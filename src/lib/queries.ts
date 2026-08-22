import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  Category,
  Product,
  Branch,
  BlogPost,
  GalleryItem,
  Review,
  FreshBakeItem,
  Announcement,
  Settings,
} from '@/types';

export const queryKeys = {
  categories: ['categories'] as const,
  products: ['products'] as const,
  product: (slug: string) => ['product', slug] as const,
  branches: ['branches'] as const,
  blog: ['blog'] as const,
  blogPost: (slug: string) => ['blog-post', slug] as const,
  gallery: ['gallery'] as const,
  reviews: ['reviews'] as const,
  freshBake: ['fresh-bake'] as const,
  announcements: ['announcements'] as const,
  settings: ['settings'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Branch[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blog,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogPost(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: queryKeys.gallery,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryItem[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useReviews() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Review[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useFreshBake() {
  return useQuery({
    queryKey: queryKeys.freshBake,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fresh_bake_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as FreshBakeItem[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .eq('variant', 'bar')
        .order('display_order', { ascending: true })
        .limit(1);
      if (error) throw error;
      return data as Announcement[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
    staleTime: 1000 * 60 * 10,
  });
}
