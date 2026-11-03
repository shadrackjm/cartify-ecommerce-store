<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Request $request, Product $product): Response
    {
        $product->load(['variants', 'category', 'reviews.user']);

        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_published', true)
            ->with('variants')
            ->limit(4)
            ->get();

        $user = $request->user();
        $canReview = false;
        $alreadyReviewed = false;

        if ($user) {
            $variantIds = $product->variants->pluck('id');

            $canReview = OrderItem::whereIn('product_variant_id', $variantIds)
                ->whereHas('order', fn ($query) => $query->where('user_id', $user->id)->where('status', 'delivered'))
                ->exists();

            $alreadyReviewed = Review::where('product_id', $product->id)->where('user_id', $user->id)->exists();
        }

        return Inertia::render('products/show', [
            'product' => $product,
            'related' => $related,
            'averageRating' => round((float) $product->reviews->avg('rating'), 1),
            'canReview' => $canReview && ! $alreadyReviewed,
        ]);
    }
}
