import { Head, Link, router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Order, OrderStatus, Paginated } from '@/types';

interface Props {
    orders: Paginated<Order>;
    filters: { status?: string };
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

export default function AdminOrdersIndex({ orders, filters }: Props) {
    function filterByStatus(status: string) {
        router.get(
            '/admin/orders',
            { status: status === 'all' ? undefined : status },
            { preserveState: true },
        );
    }

    return (
        <>
            <Head title="Orders" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={filterByStatus}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
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

                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    Order
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Customer
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
                                            href={`/admin/orders/${order.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.user?.name}
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        {order.status}
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

                {orders.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {orders.links.map((link, i) =>
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
        </>
    );
}
