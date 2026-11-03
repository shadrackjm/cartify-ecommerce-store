import { Head, Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import type { Order, OrderStatus, Paginated } from '@/types';

interface Props {
    orders: Paginated<Order>;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    paid: 'bg-blue-500/10 text-blue-600',
    processing: 'bg-amber-500/10 text-amber-600',
    shipped: 'bg-indigo-500/10 text-indigo-600',
    delivered: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-rose-500/10 text-rose-600',
    refunded: 'bg-rose-500/10 text-rose-600',
};

export default function OrdersIndex({ orders }: Props) {
    return (
        <>
            <Head title="My Orders" />

            <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

            {orders.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                    <Package className="mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="font-semibold">No orders yet</p>
                    <Link
                        href="/shop"
                        className="mt-2 text-sm text-primary hover:underline"
                    >
                        Start shopping
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    Order
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Items
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-muted/20"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {order.created_at.slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {order.items_count}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        ${order.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
