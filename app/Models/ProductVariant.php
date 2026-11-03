<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['product_id', 'sku', 'size', 'color', 'price', 'stock_quantity', 'image_path'])]
#[Appends(['label', 'effective_price', 'image_url'])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * A human label like "Size: M · Color: Blue", skipping whichever
     * dimension this variant doesn't use.
     *
     * @return Attribute<string, never>
     */
    protected function label(): Attribute
    {
        return Attribute::get(function (): string {
            $parts = array_filter([
                $this->size ? "Size: {$this->size}" : null,
                $this->color ? "Color: {$this->color}" : null,
            ]);

            return $parts ? implode(' · ', $parts) : 'Default';
        });
    }

    /**
     * A variant's own price overrides the product's base price when set —
     * letting a single product hold variants at different price points
     * (a larger size costing more) without duplicating the whole product.
     *
     * @return Attribute<float, never>
     */
    protected function effectivePrice(): Attribute
    {
        return Attribute::get(fn (): float => (float) ($this->price ?? $this->product->base_price));
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->image_path ? Storage::url($this->image_path) : null);
    }
}
