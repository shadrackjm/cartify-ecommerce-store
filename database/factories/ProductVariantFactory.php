<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => 'SKU-'.strtoupper(fake()->unique()->bothify('??####')),
            'size' => null,
            'color' => null,
            'price' => null,
            'stock_quantity' => fake()->numberBetween(0, 60),
            'image_path' => null,
        ];
    }
}
