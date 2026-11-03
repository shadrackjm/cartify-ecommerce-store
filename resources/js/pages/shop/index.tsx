import { Head, Link, router } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Category, Paginated, Product } from '@/types';

interface Props {
    products: Paginated<Product>;
    categories: Category[];
    filters: Record<string, string>;
}

export default function ShopIndex({ products, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');

    function apply(next: Partial<typeof filters>) {
        router.get(
            '/shop',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Shop" />

            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                <aside className="space-y-6">
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">
                            Categories
                        </h3>
                        <ul className="space-y-1 text-sm">
                            <li>
                                <button
                                    onClick={() =>
                                        apply({ category: undefined })
                                    }
                                    className={`hover:underline ${!filters.category ? 'font-medium text-primary' : 'text-muted-foreground'}`}
                                >
                                    All categories
                                </button>
                            </li>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <button
                                        onClick={() =>
                                            apply({ category: category.slug })
                                        }
                                        className={`hover:underline ${filters.category === category.slug ? 'font-medium text-primary' : 'text-muted-foreground'}`}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Price</h3>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                defaultValue={filters.min_price}
                                onBlur={(e) =>
                                    apply({
                                        min_price: e.target.value || undefined,
                                    })
                                }
                                className="h-8"
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                defaultValue={filters.max_price}
                                onBlur={(e) =>
                                    apply({
                                        max_price: e.target.value || undefined,
                                    })
                                }
                                className="h-8"
                            />
                        </div>
                    </div>
                </aside>

                <div>
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                apply({ q: q || undefined });
                            }}
                            className="flex flex-1 gap-2"
                        >
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search products…"
                            />
                            <Button type="submit" variant="outline">
                                Search
                            </Button>
                        </form>

                        <Select
                            value={filters.sort ?? 'newest'}
                            onValueChange={(value) =>
                                apply({
                                    sort:
                                        value === 'newest' ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price_asc">
                                    Price: Low to High
                                </SelectItem>
                                <SelectItem value="price_desc">
                                    Price: High to Low
                                </SelectItem>
                                <SelectItem value="rating">
                                    Top Rated
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-24 text-center text-sm text-muted-foreground">
                            No products match these filters.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="group rounded-xl border p-4 transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                                        {product.cover_url && (
                                            <img
                                                src={product.cover_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        )}
                                    </div>
                                    <p className="font-medium">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {product.category?.name}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-semibold">
                                            ${product.base_price}
                                        </span>
                                        {(product.reviews_count ?? 0) > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                {Number(
                                                    product.reviews_avg_rating,
                                                ).toFixed(1)}{' '}
                                                ({product.reviews_count})
                                            </span>
                                        )}
                                    </div>
                                    {!product.in_stock && (
                                        <p className="mt-1 text-xs font-medium text-rose-500">
                                            Out of stock
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}

                    {products.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {products.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="rounded px-3 py-1.5 text-sm opacity-40"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
