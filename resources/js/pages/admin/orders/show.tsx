import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Order, OrderStatus } from '@/types';

interface Props {
    order: Order;
}

const STATUSES: OrderStatus[] = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
];

export default function AdminOrderShow({ order }: Props) {
    const form = useForm({
        status: order.status,
        tracking_number: order.tracking_number ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.patch(`/admin/orders/${order.id}/status`, {
            onSuccess: () => toast.success('Order updated.'),
        });
    }

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Order {order.order_number}
                </h1>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-xl border p-5">
                        <div className="mb-4 flex justify-between text-sm">
                            <div>
                                <p className="font-semibold">
                                    {order.user?.name}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.email}
                                </p>
                            </div>
                            <div className="text-right text-muted-foreground">
                                <p>{order.recipient_name}</p>
                                <p>
                                    {order.line1}, {order.city}, {order.state}{' '}
                                    {order.postal_code}
                                </p>
                                <p>{order.country}</p>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2 text-left font-medium">
                                        Item
                                    </th>
                                    <th className="py-2 text-right font-medium">
                                        Price
                                    </th>
                                    <th className="py-2 text-right font-medium">
                                        Qty
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2">
                                            {item.product_name}{' '}
                                            {item.variant_label &&
                                                item.variant_label !==
                                                    'Default' && (
                                                    <span className="text-muted-foreground">
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 ml-auto max-w-xs space-y-1 border-t pt-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>${order.subtotal}</span>
                            </div>
                            {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount</span>
                                    <span>-${order.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>
                                <span>${order.shipping_fee}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total</span>
                                <span>${order.total}</span>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="h-fit space-y-4 rounded-xl border p-5"
                    >
                        <p className="font-semibold">Update status</p>
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData('status', value as OrderStatus)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map((s) => (
                                        <SelectItem
                                            key={s}
                                            value={s}
                                            className="capitalize"
                                        >
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="tracking">Tracking number</Label>
                            <Input
                                id="tracking"
                                value={form.data.tracking_number}
                                onChange={(e) =>
                                    form.setData(
                                        'tracking_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="TRACK-123456"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Saving…' : 'Save'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
