export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  discount_price: number | null;
  currency: string;
  sku: string | null;
  stock_status: StockStatus;
  stock_quantity: number;
  images: string[];
  ingredients: string | null;
  nutritional_info: string | null;
  allergen_info: string | null;
  tags: string[];
  badges: string[];
  is_featured: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  hours: string | null;
  map_url: string | null;
  map_embed: string | null;
  latitude: number | null;
  longitude: number | null;
  is_main: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  views: number;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  title: string | null;
  image_url: string;
  alt_text: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  fulfillment: 'delivery' | 'pickup';
  delivery_address: string | null;
  branch_id: string | null;
  line_items: CartLineItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  branch?: Branch | null;
};

export type CartLineItem = {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

export type CakeRequest = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  cake_type: string | null;
  size: string | null;
  flavour: string | null;
  layers: string | null;
  frosting: string | null;
  colors: string | null;
  cake_message: string | null;
  inspiration_image_url: string | null;
  collection_date: string | null;
  fulfillment: 'delivery' | 'pickup';
  delivery_address: string | null;
  special_instructions: string | null;
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
};

export type CateringRequest = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  organization: string | null;
  event_type: string | null;
  event_date: string | null;
  guest_count: number | null;
  service_type: string | null;
  menu_preferences: string | null;
  budget: string | null;
  special_instructions: string | null;
  status: 'new' | 'reviewing' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
};

export type ContactMessageType =
  | 'general'
  | 'cake'
  | 'corporate'
  | 'catering'
  | 'career'
  | 'newsletter';

export type ContactMessage = {
  id: string;
  type: ContactMessageType;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  attachment_url: string | null;
  position_applied: string | null;
  is_read: boolean;
  reply_status: 'pending' | 'replied' | 'archived';
  created_at: string;
};

export type Review = {
  id: string;
  author_name: string;
  author_photo: string | null;
  rating: number;
  text: string;
  source: string;
  source_url: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type FreshBakeItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  availability: 'available' | 'limited' | 'sold_out';
  stock_note: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type Announcement = {
  id: string;
  text: string;
  link: string | null;
  variant: 'bar' | 'banner' | 'popup';
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  created_at: string;
};

export type Settings = {
  id: number;
  business_name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  delivery_charge: number;
  timezone: string;
  maintenance_mode: boolean;
  announcement_bar_enabled: boolean;
  enable_delivery: boolean;
  enable_pickup: boolean;
  enable_ordering: boolean;
  newsletter_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image_url: string | null;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  average_rating: number;
  review_count: number;
  trust_since: number;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string;
};
