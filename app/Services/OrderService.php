<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public const SHIPPING_METHODS = [
        'standard' => ['label' => 'Standard (3-5 days)', 'fee' => 5.00],
        'express' => ['label' => 'Express (1-2 days)', 'fee' => 15.00],
    ];

    /**
     * Turn the current cart into a real order: snapshot every price and
     * product name at this exact moment, so a later price change or product
     * edit never rewrites what a customer already agreed to pay.
     */
    public function createFromCart(User $user, CartService $cart, array $address, string $shippingMethod): Order
    {
        $summary = $cart->summary();

        abort_if($summary['items']->isEmpty(), 422, 'Your cart is empty.');

        $shippingFee = self::SHIPPING_METHODS[$shippingMethod]['fee'] ?? 0;

        return DB::transaction(function () use ($user, $summary, $address, $shippingMethod, $shippingFee) {
            $order = Order::create([
                'user_id' => $user->id,
                'coupon_id' => $summary['coupon']?->id,
                'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                'email' => $user->email,
                ...$address,
                'shipping_method' => $shippingMethod,
                'shipping_fee' => $shippingFee,
                'subtotal' => $summary['subtotal'],
                'discount' => $summary['discount'],
                'total' => round($summary['subtotal'] - $summary['discount'] + $shippingFee, 2),
                'status' => 'pending',
            ]);

            foreach ($summary['items'] as $line) {
                $variant = $line['variant'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_label' => $variant->label,
                    'sku' => $variant->sku,
                    'price' => $variant->effective_price,
                    'quantity' => $line['quantity'],
                ]);
            }

            return $order;
        });
    }

    /**
     * Mark an order paid, exactly once. Called from both the browser return
     * URL and the Stripe webhook, so it must be safe to run twice for the
     * same order without double-decrementing stock or double-counting a
     * coupon's use.
     */
    public function markPaid(Order $order, string $method, ?string $reference = null): void
    {
        if ($order->status !== 'pending') {
            return;
        }

        DB::transaction(function () use ($order, $method, $reference) {
            foreach ($order->items as $item) {
                if ($item->variant) {
                    $item->variant->decrement('stock_quantity', min($item->quantity, $item->variant->stock_quantity));
                    $item->variant->product()->increment('sales_count', $item->quantity);
                }
            }

            if ($order->coupon_id) {
                Coupon::whereKey($order->coupon_id)->increment('used_count');
            }

            $order->update([
                'status' => 'paid',
                'payment_method' => $method,
                'payment_reference' => $reference,
                'paid_at' => now(),
            ]);
        });
    }
}
