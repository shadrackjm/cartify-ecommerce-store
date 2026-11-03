import { Head, Link, router } from '@inertiajs/react';
import { Heart, X } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
    products: Product[];
}

export default function WishlistIndex({ products }: Props) {
    function remove(productId: number) {
        router.delete(`/wishlist/${productId}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Wishlist" />

            <h1 className="mb-6 text-2xl font-bold">Your Wishlist</h1>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                    <Heart className="mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="font-semibold">Nothing saved yet</p>
                    <Link
                        href="/shop"
                        className="mt-2 text-sm text-primary hover:underline"
                    >
                        Browse the shop
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative rounded-xl border p-4"
                        >
                            <button
                                onClick={() => remove(product.id)}
                                className="absolute top-3 right-3 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <Link href={`/products/${product.slug}`}>
                                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                                    {product.cover_url && (
                                        <img
                                            src={product.cover_url}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    ${product.base_price}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
