<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The landing page is the storefront's front door, so it shows real
     * catalog data rather than marketing screenshots — best sellers and
     * the category list, every one of them a link straight into the shop.
     */
    public function index(): Response
    {
        $featured = Product::query()
            ->where('is_published', true)
            // `variants` feeds the appended `in_stock` accessor; without it each
            // card would fire its own query as the payload is serialised.
            ->with(['category', 'variants'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->orderByDesc('sales_count')
            ->limit(4)
            ->get();

        return Inertia::render('welcome', [
            'featured' => $featured,
            'categories' => Category::whereNull('parent_id')
                ->withCount(['products' => fn ($query) => $query->where('is_published', true)])
                ->orderBy('name')
                ->get(),
        ]);
    }
}
