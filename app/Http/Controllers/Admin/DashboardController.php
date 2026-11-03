<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected const LOW_STOCK_THRESHOLD = 5;

    public function index(): Response
    {
        $paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];

        $salesByDay = collect(range(6, 0))->map(function (int $daysAgo) use ($paidStatuses) {
            $date = Carbon::today()->subDays($daysAgo);

            return [
                'date' => $date->format('M j'),
                'revenue' => (float) Order::whereIn('status', $paidStatuses)->whereDate('paid_at', $date)->sum('total'),
            ];
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'revenue' => (float) Order::whereIn('status', $paidStatuses)->sum('total'),
                'orders' => Order::whereIn('status', $paidStatuses)->count(),
                'products' => Product::where('is_published', true)->count(),
                'customers' => User::where('role', 'customer')->count(),
            ],
            'salesByDay' => $salesByDay,
            // `variants` is eager-loaded wherever a Product is serialised, because
            // its appended `in_stock` accessor would otherwise query per product.
            'topProducts' => Product::with('variants')->orderByDesc('sales_count')->limit(5)->get(['id', 'name', 'sales_count']),
            'lowStock' => ProductVariant::with('product.variants')
                ->where('stock_quantity', '<=', self::LOW_STOCK_THRESHOLD)
                ->orderBy('stock_quantity')
                ->limit(8)
                ->get(),
            'recentOrders' => Order::with('user')->whereIn('status', $paidStatuses)->latest('paid_at')->limit(6)->get(),
        ]);
    }
}
