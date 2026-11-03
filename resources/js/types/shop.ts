// ── Shared pagination shape returned by Laravel's paginator ──────────────────

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

// ── Storefront domain models ─────────────────────────────────────────────────

export interface Category {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    parent?: Category | null;
    children?: Category[];
    products_count?: number;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    size: string | null;
    color: string | null;
    price: string | null;
    stock_quantity: number;
    label: string;
    effective_price: number;
    image_url: string | null;
    product?: Product;
}

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    body: string | null;
    user?: { id: number; name: string };
    created_at: string;
}

export interface Product {
    id: number;
    category_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    base_price: string;
    cover_url: string | null;
    in_stock: boolean;
    is_published: boolean;
    sales_count: number;
    category?: Category | null;
    variants?: ProductVariant[];
    variants_count?: number;
    reviews?: Review[];
    reviews_count?: number;
    reviews_avg_rating?: number | null;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
    id: number;
    product_variant_id: number | null;
    product_name: string;
    variant_label: string | null;
    sku: string | null;
    price: string;
    quantity: number;
    variant?: ProductVariant | null;
}

export interface Order {
    id: number;
    order_number: string;
    email: string;
    recipient_name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postal_code: string;
    country: string;
    phone: string | null;
    shipping_method: string;
    shipping_fee: string;
    subtotal: string;
    discount: string;
    total: string;
    status: OrderStatus;
    tracking_number: string | null;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    user?: { id: number; name: string; email: string };
    items?: OrderItem[];
    items_count?: number;
    coupon?: { code: string } | null;
}

export interface Address {
    id: number;
    label: string;
    recipient_name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
}

export interface Coupon {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
}

export interface CartLine {
    variant: ProductVariant;
    quantity: number;
    line_total: number;
}

export interface CartSummary {
    items: CartLine[];
    subtotal: number;
    discount: number;
    total: number;
    coupon: Coupon | null;
}

export interface ShippingMethod {
    key: string;
    label: string;
    fee: number;
}
