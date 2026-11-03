import { Head, Link, useForm } from '@inertiajs/react';
import { Heart, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types';

interface Props {
    product: Product;
    related: Product[];
    averageRating: number;
    canReview: boolean;
}

export default function ProductShow({
    product,
    related,
    averageRating,
    canReview,
}: Props) {
    // Memoised so the `?? []` fallback does not mint a brand-new array on every
    // render, which would invalidate the `selected` memo below every single time.
    const variants = useMemo(() => product.variants ?? [], [product.variants]);

    const sizes = [
        ...new Set(variants.map((v) => v.size).filter(Boolean)),
    ] as string[];
    const colors = [
        ...new Set(variants.map((v) => v.color).filter(Boolean)),
    ] as string[];

    const [size, setSize] = useState<string | null>(sizes[0] ?? null);
    const [color, setColor] = useState<string | null>(colors[0] ?? null);

    const selected = useMemo(
        () =>
            variants.find(
                (v) => (v.size ?? null) === size && (v.color ?? null) === color,
            ) ?? variants[0],
        [variants, size, color],
    );

    const cartForm = useForm({ quantity: 1 });
    const reviewForm = useForm({ rating: 5, body: '' });
    const wishlistForm = useForm({});

    function addToCart(e: FormEvent) {
        e.preventDefault();

        if (!selected) {
            return;
        }

        cartForm.post(`/cart/${selected.id}`, {
            onSuccess: () => toast.success('Added to cart.'),
            preserveScroll: true,
        });
    }

    function submitReview(e: FormEvent) {
        e.preventDefault();
        reviewForm.post(`/products/${product.slug}/reviews`, {
            onSuccess: () => {
                toast.success('Thanks for your review!');
                reviewForm.reset();
            },
        });
    }

    function toggleWishlist() {
        wishlistForm.post(`/wishlist/${product.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Added to wishlist.'),
        });
    }

    return (
        <>
            <Head title={product.name} />

            <div className="grid gap-10 lg:grid-cols-2">
                <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                    {(selected?.image_url ?? product.cover_url) && (
                        <img
                            src={selected?.image_url ?? product.cover_url ?? ''}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">
                        {product.category?.name}
                    </p>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {averageRating > 0
                            ? `${averageRating} · ${product.reviews?.length ?? 0} reviews`
                            : 'No reviews yet'}
                    </div>
                    <p className="mt-4 text-3xl font-bold">
                        $
                        {(
                            selected?.effective_price ??
                            Number(product.base_price)
                        ).toFixed(2)}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {product.description}
                    </p>

                    <form onSubmit={addToCart} className="mt-6 space-y-4">
                        {sizes.length > 0 && (
                            <div>
                                <Label>Size</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {sizes.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSize(s)}
                                            className={`rounded-md border px-3 py-1.5 text-sm ${size === s ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-foreground'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {colors.length > 0 && (
                            <div>
                                <Label>Color</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`rounded-md border px-3 py-1.5 text-sm ${color === c ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-foreground'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selected && (
                            <p className="text-sm text-muted-foreground">
                                {selected.stock_quantity > 0
                                    ? `${selected.stock_quantity} in stock`
                                    : 'Out of stock'}{' '}
                                · SKU {selected.sku}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={
                                    !selected ||
                                    selected.stock_quantity < 1 ||
                                    cartForm.processing
                                }
                            >
                                {cartForm.processing
                                    ? 'Adding…'
                                    : 'Add to Cart'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={toggleWishlist}
                            >
                                <Heart className="mr-2 h-4 w-4" /> Wishlist
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
                <div>
                    <h2 className="mb-4 text-xl font-bold">Reviews</h2>
                    {product.reviews?.length === 0 || !product.reviews ? (
                        <p className="text-sm text-muted-foreground">
                            No reviews yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {product.reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">
                                            {review.user?.name}
                                        </p>
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    {review.body && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {review.body}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {canReview && (
                        <form
                            onSubmit={submitReview}
                            className="mt-6 space-y-3 rounded-lg border p-4"
                        >
                            <p className="text-sm font-medium">
                                Leave a review
                            </p>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() =>
                                            reviewForm.setData('rating', i + 1)
                                        }
                                    >
                                        <Star
                                            className={`h-5 w-5 ${i < reviewForm.data.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewForm.data.body}
                                onChange={(e) =>
                                    reviewForm.setData('body', e.target.value)
                                }
                                placeholder="What did you think?"
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            <InputError message={reviewForm.errors.body} />
                            <Button
                                type="submit"
                                disabled={reviewForm.processing}
                                size="sm"
                            >
                                {reviewForm.processing
                                    ? 'Submitting…'
                                    : 'Submit Review'}
                            </Button>
                        </form>
                    )}
                </div>

                {related.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-xl font-bold">
                            You may also like
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/products/${item.slug}`}
                                    className="rounded-lg border p-3 hover:shadow-sm"
                                >
                                    <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
                                        {item.cover_url && (
                                            <img
                                                src={item.cover_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ${item.base_price}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
