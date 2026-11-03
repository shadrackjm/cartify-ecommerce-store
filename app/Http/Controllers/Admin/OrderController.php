<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::with('user')
            ->withCount('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load(['items', 'user', 'coupon']),
        ]);
    }

    /**
     * Moving an order forward through its lifecycle. Each status stamps the
     * timestamp that belongs to it, so the customer's tracking timeline
     * always reflects exactly when each stage actually happened.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,processing,shipped,delivered,cancelled,refunded'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ]);

        $timestamps = match ($data['status']) {
            'shipped' => ['shipped_at' => $order->shipped_at ?? now()],
            'delivered' => ['delivered_at' => $order->delivered_at ?? now()],
            default => [],
        };

        $order->update([...$data, ...$timestamps]);

        return back()->with('success', 'Order updated.');
    }
}
