<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('variants', 'public');
        }

        $product->variants()->create($data);

        return back()->with('success', 'Variant added.');
    }

    public function update(Request $request, ProductVariant $variant): RedirectResponse
    {
        $data = $this->validated($request, $variant->id);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('variants', 'public');
        }

        $variant->update($data);

        return back()->with('success', 'Variant updated.');
    }

    public function destroy(ProductVariant $variant): RedirectResponse
    {
        $variant->delete();

        return back();
    }

    protected function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'sku' => ['required', 'string', 'max:50', Rule::unique('product_variants', 'sku')->ignore($ignoreId)],
            'size' => ['nullable', 'string', 'max:30'],
            'color' => ['nullable', 'string', 'max:30'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);
    }
}
