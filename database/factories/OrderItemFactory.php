<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_variant_id' => ProductVariant::factory(),
            'product_name' => fake()->words(3, true),
            'variant_label' => 'Default',
            'sku' => 'SKU-'.strtoupper(fake()->bothify('??####')),
            'price' => fake()->randomFloat(2, 15, 250),
            'quantity' => fake()->numberBetween(1, 3),
        ];
    }
}
