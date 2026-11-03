<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(CartService $cart): Response
    {
        return Inertia::render('cart/index', [
            'summary' => $cart->summary(),
        ]);
    }

    public function store(Request $request, CartService $cart, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validate(['quantity' => ['nullable', 'integer', 'min:1']]);

        if ($variant->stock_quantity < 1) {
            return back()->withErrors(['quantity' => 'That item is out of stock.']);
        }

        $cart->add($variant->id, $data['quantity'] ?? 1);

        return back();
    }

    public function update(Request $request, CartService $cart, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:0']]);

        $cart->update($variant->id, $data['quantity']);

        return back();
    }

    public function destroy(CartService $cart, ProductVariant $variant): RedirectResponse
    {
        $cart->remove($variant->id);

        return back();
    }

    public function applyCoupon(Request $request, CartService $cart): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string']]);
        $result = $cart->applyCoupon($data['code']);

        return $result['ok'] ? back() : back()->withErrors(['code' => $result['message']]);
    }

    public function removeCoupon(CartService $cart): RedirectResponse
    {
        $cart->removeCoupon();

        return back();
    }
}
