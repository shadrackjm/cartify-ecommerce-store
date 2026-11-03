<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->where('is_published', true)
            // `variants` is eager-loaded for the appended `in_stock` accessor, which
            // would otherwise fire one query per product as the page is serialised.
            ->with(['category', 'variants'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->when($request->filled('category'), function ($query) use ($request) {
                $category = Category::where('slug', $request->input('category'))->first();
                $query->where('category_id', $category?->id);
            })
            ->when($request->filled('q'), fn ($query) => $query->where('name', 'like', '%'.$request->input('q').'%'))
            ->when($request->filled('min_price'), fn ($query) => $query->where('base_price', '>=', $request->input('min_price')))
            ->when($request->filled('max_price'), fn ($query) => $query->where('base_price', '<=', $request->input('max_price')))
            ->when($request->input('sort') === 'price_asc', fn ($query) => $query->orderBy('base_price'))
            ->when($request->input('sort') === 'price_desc', fn ($query) => $query->orderByDesc('base_price'))
            ->when($request->input('sort') === 'rating', fn ($query) => $query->orderByDesc('reviews_avg_rating'))
            ->when(! $request->filled('sort'), fn ($query) => $query->latest())
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('shop/index', [
            'products' => $products,
            'categories' => Category::whereNull('parent_id')->with('children')->orderBy('name')->get(),
            'filters' => $request->only(['category', 'q', 'min_price', 'max_price', 'sort']),
        ]);
    }
}
