<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function index(Request $request, CartService $cart): Response
    {
        $summary = $cart->summary();

        return Inertia::render('checkout/index', [
            'summary' => $summary,
            'addresses' => $request->user()->addresses()->orderByDesc('is_default')->get(),
            'shippingMethods' => collect(OrderService::SHIPPING_METHODS)
                ->map(fn ($method, $key) => ['key' => $key, ...$method])
                ->values(),
        ]);
    }

    public function store(Request $request, CartService $cart, OrderService $orders): RedirectResponse
    {
        $data = $request->validate([
            'address_id' => ['required', 'exists:addresses,id'],
            'shipping_method' => ['required', 'in:standard,express'],
        ]);

        $address = $request->user()->addresses()->findOrFail($data['address_id']);
        $addressData = $address->only(['recipient_name', 'line1', 'line2', 'city', 'state', 'postal_code', 'country', 'phone']);

        $order = $orders->createFromCart($request->user(), $cart, $addressData, $data['shipping_method']);
        $cart->clear();

        if (! config('services.stripe.secret')) {
            $orders->markPaid($order, 'simulated');

            return to_route('checkout.success', $order);
        }

        return $this->startStripeCheckout($order);
    }

    protected function startStripeCheckout(Order $order): RedirectResponse
    {
        $stripe = new StripeClient(config('services.stripe.secret'));

        $lineItems = $order->items->map(fn ($item) => [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => ['name' => $item->product_name.($item->variant_label !== 'Default' ? " ({$item->variant_label})" : '')],
                'unit_amount' => (int) round($item->price * 100),
            ],
            'quantity' => $item->quantity,
        ])->push([
            'price_data' => [
                'currency' => 'usd',
                'product_data' => ['name' => 'Shipping ('.$order->shipping_method.')'],
                'unit_amount' => (int) round($order->shipping_fee * 100),
            ],
            'quantity' => 1,
        ])->all();

        $session = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'discounts' => $order->discount > 0 ? [[
                'coupon' => $stripe->coupons->create([
                    'amount_off' => (int) round($order->discount * 100),
                    'currency' => 'usd',
                    'duration' => 'once',
                ])->id,
            ]] : [],
            'customer_email' => $order->email,
            'success_url' => route('checkout.success', $order).'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout.index'),
            'metadata' => ['order_id' => $order->id],
        ]);

        return Inertia::location($session->url);
    }

    /**
     * The browser lands here right after paying. We re-verify the session
     * with Stripe directly before marking the order paid — belt and braces
     * alongside the webhook, since a browser redirect alone is not proof
     * that money actually moved.
     */
    public function success(Request $request, Order $order, OrderService $orders): Response|RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if ($order->status === 'pending' && $request->filled('session_id') && config('services.stripe.secret')) {
            $stripe = new StripeClient(config('services.stripe.secret'));
            $session = $stripe->checkout->sessions->retrieve($request->input('session_id'));

            if ($session->payment_status === 'paid') {
                $orders->markPaid($order, 'stripe', $session->id);
            }
        }

        return Redirect::route('orders.show', $order);
    }
}
