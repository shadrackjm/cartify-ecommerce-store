import { Head } from '@inertiajs/react';
import { Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface Props {
    order: Order;
}

const STAGES: { key: string; label: string }[] = [
    { key: 'paid', label: 'Paid' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
];

export default function OrderShow({ order }: Props) {
    const currentIndex = STAGES.findIndex((s) => s.key === order.status);
    const isTerminalIssue =
        order.status === 'cancelled' || order.status === 'refunded';

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="no-print mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Order {order.order_number}
                </h1>
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print Invoice
                </Button>
            </div>

            {isTerminalIssue ? (
                <div className="no-print mb-8 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                    This order was {order.status}.
                </div>
            ) : (
                <div className="no-print mb-8 flex items-center">
                    {STAGES.map((stage, i) => (
                        <div
                            key={stage.key}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                        i <= currentIndex
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {i <= currentIndex ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className="text-xs">{stage.label}</span>
                            </div>
                            {i < STAGES.length - 1 && (
                                <div
                                    className={`mx-2 h-px flex-1 ${i < currentIndex ? 'bg-primary' : 'bg-muted'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {order.tracking_number && (
                <p className="no-print mb-6 text-sm">
                    Tracking number:{' '}
                    <span className="font-medium">{order.tracking_number}</span>
                </p>
            )}

            <div className="invoice-paper rounded-xl border p-6">
                <div className="mb-6 flex justify-between text-sm">
                    <div>
                        <p className="font-semibold">Ship to</p>
                        <p>{order.recipient_name}</p>
                        <p>{order.line1}</p>
                        {order.line2 && <p>{order.line2}</p>}
                        <p>
                            {order.city}, {order.state} {order.postal_code}
                        </p>
                        <p>{order.country}</p>
                    </div>
                    <div className="text-right">
                        <p>
                            <span className="text-muted-foreground">
                                Order date:
                            </span>{' '}
                            {order.created_at.slice(0, 10)}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Shipping method:
                            </span>{' '}
                            {order.shipping_method}
                        </p>
                        {order.coupon && (
                            <p>
                                <span className="text-muted-foreground">
                                    Coupon:
                                </span>{' '}
                                {order.coupon.code}
                            </p>
                        )}
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead className="border-b">
                        <tr>
                            <th className="py-2 text-left font-medium">Item</th>
                            <th className="py-2 text-right font-medium">
                                Price
                            </th>
                            <th className="py-2 text-right font-medium">Qty</th>
                            <th className="py-2 text-right font-medium">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {order.items?.map((item) => (
                            <tr key={item.id}>
                                <td className="py-2">
                                    {item.product_name}
                                    {item.variant_label &&
                                        item.variant_label !== 'Default' && (
                                            <span className="text-muted-foreground">
                                                {' '}
                                                ({item.variant_label})
                                            </span>
                                        )}
                                </td>
                                <td className="py-2 text-right">
                                    ${item.price}
                                </td>
                                <td className="py-2 text-right">
                                    {item.quantity}
                                </td>
                                <td className="py-2 text-right">
                                    $
                                    {(
                                        Number(item.price) * item.quantity
                                    ).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${order.subtotal}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>-${order.discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${order.shipping_fee}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-base font-semibold">
                        <span>Total</span>
                        <span>${order.total}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
