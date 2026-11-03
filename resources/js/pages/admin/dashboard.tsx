import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    DollarSign,
    Package,
    ShoppingBag,
    Users,
} from 'lucide-react';

interface Stats {
    revenue: number;
    orders: number;
    products: number;
    customers: number;
}

interface SalesDay {
    date: string;
    revenue: number;
}

interface TopProduct {
    id: number;
    name: string;
    sales_count: number;
}

interface LowStockVariant {
    id: number;
    sku: string;
    stock_quantity: number;
    label: string;
    product: { id: number; name: string };
}

interface RecentOrder {
    id: number;
    order_number: string;
    total: string;
    status: string;
    user?: { name: string };
}

interface Props {
    stats: Stats;
    salesByDay: SalesDay[];
    topProducts: TopProduct[];
    lowStock: LowStockVariant[];
    recentOrders: RecentOrder[];
}

export default function AdminDashboard({
    stats,
    salesByDay,
    topProducts,
    lowStock,
    recentOrders,
}: Props) {
    const maxRevenue = Math.max(1, ...salesByDay.map((d) => d.revenue));

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Revenue"
                        value={`$${stats.revenue.toFixed(2)}`}
                    />
                    <StatCard
                        icon={<ShoppingBag className="h-5 w-5" />}
                        label="Paid orders"
                        value={stats.orders}
                    />
                    <StatCard
                        icon={<Package className="h-5 w-5" />}
                        label="Published products"
                        value={stats.products}
                    />
                    <StatCard
                        icon={<Users className="h-5 w-5" />}
                        label="Customers"
                        value={stats.customers}
                    />
                </div>

                <div className="rounded-xl border p-5">
                    <h2 className="mb-4 font-semibold">Revenue, last 7 days</h2>
                    <div className="flex h-40 items-end gap-2">
                        {salesByDay.map((day) => (
                            <div
                                key={day.date}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                            >
                                <div
                                    className="w-full rounded-t bg-primary"
                                    style={{
                                        height: `${(day.revenue / maxRevenue) * 100}%`,
                                    }}
                                    title={`$${day.revenue.toFixed(2)}`}
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    {day.date}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border p-5 lg:col-span-1">
                        <h2 className="mb-4 font-semibold">Top products</h2>
                        <div className="space-y-2">
                            {topProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex justify-between text-sm"
                                >
                                    <span>{product.name}</span>
                                    <span className="font-medium">
                                        {product.sales_count} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border p-5 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h2 className="font-semibold">Low stock</h2>
                        </div>
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Everything is well stocked.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {lowStock.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <span>
                                            {variant.product.name}{' '}
                                            <span className="text-muted-foreground">
                                                ({variant.label})
                                            </span>
                                        </span>
                                        <span
                                            className={`font-medium ${variant.stock_quantity === 0 ? 'text-rose-500' : 'text-amber-600'}`}
                                        >
                                            {variant.stock_quantity} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border p-5 lg:col-span-1">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Recent orders</h2>
                            <Link
                                href="/admin/orders"
                                className="text-sm text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex justify-between text-sm hover:underline"
                                >
                                    <span>{order.order_number}</span>
                                    <span className="font-medium">
                                        ${order.total}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}
