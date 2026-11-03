<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'email' => fake()->safeEmail(),
            'recipient_name' => fake()->name(),
            'line1' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'country' => 'United States',
            'phone' => fake()->phoneNumber(),
            'shipping_method' => 'standard',
            'shipping_fee' => 5,
            'subtotal' => fake()->randomFloat(2, 30, 300),
            'discount' => 0,
            'total' => fake()->randomFloat(2, 35, 305),
            'status' => 'pending',
        ];
    }
}
