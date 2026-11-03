<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('wishlist/index', [
            'products' => $request->user()->wishlists()->with('product.category')->latest()->get()->pluck('product'),
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlists()->firstOrCreate(['product_id' => $product->id]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlists()->where('product_id', $product->id)->delete();

        return back();
    }
}
