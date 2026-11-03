import { Head, Link, router, useForm } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CartSummary } from '@/types';

interface Props {
    summary: CartSummary;
}

export default function CartIndex({ summary }: Props) {
    const [code, setCode] = useState('');
    const couponForm = useForm({ code: '' });

    function updateQty(variantId: number, quantity: number) {
        router.patch(
            `/cart/${variantId}`,
            { quantity },
            { preserveScroll: true },
        );
    }

    function remove(variantId: number) {
        router.delete(`/cart/${variantId}`, { preserveScroll: true });
    }

    function applyCoupon(e: FormEvent) {
        e.preventDefault();
        couponForm.transform(() => ({ code }));
        couponForm.post('/cart/coupon', { preserveScroll: true });
    }

    function removeCoupon() {
        router.delete('/cart/coupon', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Your Cart" />

            <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

            {summary.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                    <ShoppingCart className="mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="font-semibold">Your cart is empty</p>
                    <Button className="mt-4" asChild>
                        <Link href="/shop">Continue shopping</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        {summary.items.map((line) => (
                            <div
                                key={line.variant.id}
                                className="flex items-center gap-4 rounded-lg border p-4"
                            >
                                <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                                    {(line.variant.image_url ??
                                        line.variant.product?.cover_url) && (
                                        <img
                                            src={
                                                line.variant.image_url ??
                                                line.variant.product
                                                    ?.cover_url ??
                                                ''
                                            }
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Link
                                        href={`/products/${line.variant.product?.slug}`}
                                        className="font-medium hover:underline"
                                    >
                                        {line.variant.product?.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {line.variant.label}
                                    </p>
                                    <p className="text-sm font-medium">
                                        $
                                        {line.variant.effective_price.toFixed(
                                            2,
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            updateQty(
                                                line.variant.id,
                                                line.quantity - 1,
                                            )
                                        }
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm">
                                        {line.quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            updateQty(
                                                line.variant.id,
                                                line.quantity + 1,
                                            )
                                        }
                                        disabled={
                                            line.quantity >=
                                            line.variant.stock_quantity
                                        }
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="w-20 text-right font-medium">
                                    ${line.line_total.toFixed(2)}
                                </p>
                                <button
                                    onClick={() => remove(line.variant.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="h-fit space-y-4 rounded-xl border p-5">
                        <form onSubmit={applyCoupon} className="space-y-2">
                            <p className="text-sm font-medium">Coupon code</p>
                            {summary.coupon ? (
                                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                                    <span className="font-medium">
                                        {summary.coupon.code}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
                                        placeholder="e.g. WELCOME10"
                                        className="h-9"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}
                            <InputError message={couponForm.errors.code} />
                        </form>

                        <div className="space-y-1 border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>${summary.subtotal.toFixed(2)}</span>
                            </div>
                            {summary.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount</span>
                                    <span>-${summary.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                <span>Total</span>
                                <span>${summary.total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Shipping calculated at checkout.
                            </p>
                        </div>

                        <Button className="w-full" asChild>
                            <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
