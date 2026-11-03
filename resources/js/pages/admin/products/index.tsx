import { Head, Link, router } from '@inertiajs/react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated, Product } from '@/types';

interface Props {
    products: Paginated<Product>;
    filters: { search?: string };
}

export default function AdminProductsIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/products',
            { search: search || undefined },
            { preserveState: true },
        );
    }

    function handleDelete(product: Product) {
        if (!confirm(`Delete "${product.name}" and all its variants?`)) {
            return;
        }

        router.delete(`/admin/products/${product.id}`, {
            onSuccess: () => toast.success('Product deleted.'),
        });
    }

    return (
        <>
            <Head title="Products" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Button asChild>
                        <Link href="/admin/products/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="mb-4 flex max-w-sm gap-2"
                >
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products…"
                    />
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>

                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <Package className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No products yet</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Base Price
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Variants
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-muted/20"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {product.category?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                ${product.base_price}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {product.variants_count ?? 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${product.is_published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {product.is_published
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {products.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-1">
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
                    </>
                )}
            </div>
        </>
    );
}
