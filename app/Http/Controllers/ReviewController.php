<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * A review can only be left on a product that has actually been
     * delivered to this customer — not merely ordered, and not merely paid
     * for. A physical good's promise is only kept once it arrives.
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $user = $request->user();
        $variantIds = $product->variants()->pluck('id');

        $delivered = OrderItem::whereIn('product_variant_id', $variantIds)
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id)->where('status', 'delivered'))
            ->exists();

        abort_unless($delivered, 403, 'You can only review products from delivered orders.');

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:1000'],
        ]);

        $product->reviews()->updateOrCreate(['user_id' => $user->id], $data);

        return back();
    }
}
