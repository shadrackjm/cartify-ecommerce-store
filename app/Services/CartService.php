<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Session;

class CartService
{
    /**
     * Add a variant to the session cart, clamping the requested quantity to
     * whatever stock actually exists — the cart can never hold a promise the
     * warehouse cannot keep.
     */
    public function add(int $variantId, int $quantity = 1): void
    {
        $variant = ProductVariant::findOrFail($variantId);
        $cart = $this->raw();

        $current = $cart[$variantId] ?? 0;
        $cart[$variantId] = min($current + $quantity, $variant->stock_quantity);

        Session::put('cart', $cart);
    }

    public function update(int $variantId, int $quantity): void
    {
        $variant = ProductVariant::findOrFail($variantId);
        $cart = $this->raw();

        if ($quantity <= 0) {
            unset($cart[$variantId]);
        } else {
            $cart[$variantId] = min($quantity, $variant->stock_quantity);
        }

        Session::put('cart', $cart);
    }

    public function remove(int $variantId): void
    {
        $cart = $this->raw();
        unset($cart[$variantId]);
        Session::put('cart', $cart);
    }

    public function clear(): void
    {
        Session::forget('cart');
        Session::forget('coupon_code');
    }

    public function count(): int
    {
        return array_sum($this->raw());
    }

    /**
     * Every line in the cart, hydrated from the database so prices and
     * stock are always read fresh — never trusted from whatever was in the
     * session when the item was added.
     *
     * @return Collection<int, array{variant: ProductVariant, quantity: int, line_total: float}>
     */
    public function items(): Collection
    {
        $cart = $this->raw();

        if (empty($cart)) {
            return collect();
        }

        return ProductVariant::with('product')
            ->whereIn('id', array_keys($cart))
            ->get()
            ->map(fn (ProductVariant $variant) => [
                'variant' => $variant,
                'quantity' => min($cart[$variant->id], $variant->stock_quantity),
                'line_total' => round($variant->effective_price * min($cart[$variant->id], $variant->stock_quantity), 2),
            ]);
    }

    public function applyCoupon(string $code): array
    {
        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon || ! $coupon->isRedeemable()) {
            return ['ok' => false, 'message' => 'That coupon code is not valid or has expired.'];
        }

        Session::put('coupon_code', $coupon->code);

        return ['ok' => true, 'message' => 'Coupon applied.'];
    }

    public function removeCoupon(): void
    {
        Session::forget('coupon_code');
    }

    public function coupon(): ?Coupon
    {
        $code = Session::get('coupon_code');

        return $code ? Coupon::where('code', $code)->first() : null;
    }

    /**
     * @return array{items: Collection, subtotal: float, discount: float, total: float, coupon: ?Coupon}
     */
    public function summary(): array
    {
        $items = $this->items();
        $subtotal = round($items->sum('line_total'), 2);
        $coupon = $this->coupon();
        $discount = $coupon && $coupon->isRedeemable() ? $coupon->discountFor($subtotal) : 0.0;

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => round($subtotal - $discount, 2),
            'coupon' => $coupon,
        ];
    }

    /**
     * @return array<int, int>
     */
    protected function raw(): array
    {
        return Session::get('cart', []);
    }
}
