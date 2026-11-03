import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import type { Address, CartSummary, ShippingMethod } from '@/types';

interface Props {
    summary: CartSummary;
    addresses: Address[];
    shippingMethods: ShippingMethod[];
}

export default function CheckoutIndex({
    summary,
    addresses,
    shippingMethods,
}: Props) {
    const [addressId, setAddressId] = useState<string>(
        String(
            addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? '',
        ),
    );
    const [shippingMethod, setShippingMethod] = useState(
        shippingMethods[0]?.key ?? 'standard',
    );

    const form = useForm({
        address_id: addressId,
        shipping_method: shippingMethod,
    });

    const selectedShipping = shippingMethods.find(
        (m) => m.key === shippingMethod,
    );
    const total = summary.total + (selectedShipping?.fee ?? 0);

    function submit(e: FormEvent) {
        e.preventDefault();
        form.transform(() => ({
            address_id: addressId,
            shipping_method: shippingMethod,
        }));
        form.post('/checkout');
    }

    if (addresses.length === 0) {
        return (
            <>
                <Head title="Checkout" />
                <div className="rounded-xl border border-dashed py-24 text-center">
                    <p className="font-semibold">
                        You need a shipping address first
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add one from your{' '}
                        <a
                            href="/addresses"
                            className="text-primary hover:underline"
                        >
                            addresses page
                        </a>
                        , then come back to check out.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />

            <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

            <form
                onSubmit={submit}
                className="grid gap-8 lg:grid-cols-[1fr_320px]"
            >
                <div className="space-y-8">
                    <div>
                        <h2 className="mb-3 font-semibold">Shipping address</h2>
                        <div className="space-y-2">
                            {addresses.map((address) => (
                                <label
                                    key={address.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${addressId === String(address.id) ? 'border-primary' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        checked={
                                            addressId === String(address.id)
                                        }
                                        onChange={() =>
                                            setAddressId(String(address.id))
                                        }
                                        className="mt-1"
                                    />
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {address.label} —{' '}
                                            {address.recipient_name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {address.line1}, {address.city},{' '}
                                            {address.state}{' '}
                                            {address.postal_code},{' '}
                                            {address.country}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <InputError message={form.errors.address_id} />
                    </div>

                    <div>
                        <h2 className="mb-3 font-semibold">Shipping method</h2>
                        <div className="space-y-2">
                            {shippingMethods.map((method) => (
                                <label
                                    key={method.key}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 ${shippingMethod === method.key ? 'border-primary' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            checked={
                                                shippingMethod === method.key
                                            }
                                            onChange={() =>
                                                setShippingMethod(method.key)
                                            }
                                        />
                                        <span className="text-sm">
                                            {method.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        ${method.fee.toFixed(2)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-fit space-y-4 rounded-xl border p-5">
                    <p className="font-semibold">Order summary</p>
                    <div className="space-y-1 text-sm">
                        {summary.items.map((line) => (
                            <div
                                key={line.variant.id}
                                className="flex justify-between"
                            >
                                <span className="text-muted-foreground">
                                    {line.variant.product?.name} ×{' '}
                                    {line.quantity}
                                </span>
                                <span>${line.line_total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1 border-t pt-3 text-sm">
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
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Shipping
                            </span>
                            <span>
                                ${(selectedShipping?.fee ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base font-semibold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing}
                    >
                        {form.processing ? 'Placing order…' : 'Place Order'}
                    </Button>
                </div>
            </form>
        </>
    );
}
