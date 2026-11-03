<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable(['category_id', 'name', 'slug', 'description', 'base_price', 'cover_image_path', 'is_published'])]
#[Appends(['cover_url', 'in_stock'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'is_published' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * `chaperone()` back-populates each variant's `product` relation with this
     * same instance as they are loaded. Without it, every variant's appended
     * `effective_price` accessor lazy-loads its own copy of the parent product —
     * one query per variant, plus a nested product in the JSON payload whose own
     * `in_stock` accessor then queries again.
     *
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->chaperone();
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * @return HasMany<Wishlist, $this>
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->cover_image_path ? Storage::url($this->cover_image_path) : null);
    }

    /**
     * True as long as at least one variant still has stock. A product with
     * no variants at all is treated as unavailable — every sellable product
     * must have at least one real, trackable variant, even a lone "Default".
     *
     * @return Attribute<bool, never>
     */
    protected function inStock(): Attribute
    {
        return Attribute::get(function (): bool {
            $variants = $this->relationLoaded('variants') ? $this->variants : $this->variants()->get();

            return $variants->sum('stock_quantity') > 0;
        });
    }
}
