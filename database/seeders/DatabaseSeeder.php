<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed a believable storefront: role accounts, a small nested category
     * tree, a real catalog with variants (some deliberately low on stock),
     * coupons (including one expired, to prove that path fails correctly),
     * a week of paid orders for the dashboard chart, and a demo customer
     * with an order history spanning every stage of the pipeline.
     */
    public function run(): void
    {
        $admin = User::factory()->create(['name' => 'Alex Admin', 'email' => 'admin@shop.test', 'role' => 'admin']);
        $customer = User::factory()->create(['name' => 'Casey Customer', 'email' => 'customer@shop.test', 'role' => 'customer']);

        Address::factory()->create(['user_id' => $customer->id, 'label' => 'Home']);

        // ── Categories, one nested pair to prove the self-referential model works ──
        $apparel = Category::create(['name' => 'Apparel', 'slug' => 'apparel']);
        Category::create(['name' => "Men's", 'slug' => 'mens-apparel', 'parent_id' => $apparel->id]);
        Category::create(['name' => "Women's", 'slug' => 'womens-apparel', 'parent_id' => $apparel->id]);
        $footwear = Category::create(['name' => 'Footwear', 'slug' => 'footwear']);
        $accessories = Category::create(['name' => 'Accessories', 'slug' => 'accessories']);
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);

        $catalogBlueprint = [
            [$apparel, 'Classic Cotton Tee', 24.99, ['size' => ['S', 'M', 'L', 'XL'], 'color' => ['Black', 'White', 'Navy']]],
            [$apparel, 'Fleece Hoodie', 44.99, ['size' => ['S', 'M', 'L', 'XL'], 'color' => ['Charcoal', 'Forest Green']]],
            [$footwear, 'Trail Running Shoe', 89.99, ['size' => ['8', '9', '10', '11'], 'color' => ['Black', 'Grey']]],
            [$footwear, 'Canvas Sneaker', 54.99, ['size' => ['7', '8', '9', '10'], 'color' => ['White']]],
            [$accessories, 'Leather Wallet', 34.99, ['color' => ['Brown', 'Black']]],
            [$accessories, 'Canvas Tote Bag', 19.99, ['color' => ['Natural', 'Black']]],
            [$electronics, 'Wireless Earbuds', 79.99, ['color' => ['Black', 'White']]],
            [$electronics, 'Portable Bluetooth Speaker', 59.99, ['color' => ['Black']]],
        ];

        $variantPool = collect();

        foreach ($catalogBlueprint as [$category, $name, $price, $dimensions]) {
            $product = Product::create([
                'category_id' => $category->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "The {$name} — a customer favourite, built to last and priced to move.",
                'base_price' => $price,
            ]);

            $sizes = $dimensions['size'] ?? [null];
            $colors = $dimensions['color'] ?? [null];

            foreach ($sizes as $size) {
                foreach ($colors as $color) {
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::slug($name, '')).'-'.strtoupper(Str::random(4)),
                        'size' => $size,
                        'color' => $color,
                        'stock_quantity' => fake()->numberBetween(0, 40),
                    ]);

                    $variantPool->push($variant);
                }
            }
        }

        // ── Deliberately low stock on a handful of variants, for the admin alert ──
        $variantPool->random(4)->each(fn (ProductVariant $variant) => $variant->update(['stock_quantity' => fake()->numberBetween(0, 4)]));

        // ── Coupons — one healthy, one inactive, one already expired ──
        Coupon::create(['code' => 'WELCOME10', 'type' => 'percent', 'value' => 10, 'max_uses' => 500, 'expires_at' => now()->addMonths(6)]);
        Coupon::create(['code' => 'SAVE20', 'type' => 'fixed', 'value' => 20, 'max_uses' => 100, 'expires_at' => now()->addMonths(3)]);
        Coupon::create(['code' => 'EXPIRED5', 'type' => 'percent', 'value' => 5, 'expires_at' => now()->subDay()]);

        // ── A week of paid orders from random customers, for the dashboard chart ──
        for ($daysAgo = 6; $daysAgo >= 0; $daysAgo--) {
            $date = Carbon::now()->subDays($daysAgo);

            foreach (range(1, fake()->numberBetween(1, 3)) as $i) {
                $buyer = User::factory()->create();
                $lines = $variantPool->random(fake()->numberBetween(1, 3));
                $this->createOrder($buyer, $lines, 'paid', $date);
            }
        }

        // ── The demo customer's order history, one per pipeline stage ──
        $this->createOrder($customer, $variantPool->random(2), 'delivered', now()->subDays(10), 'TRACK-DEL001');
        $this->createOrder($customer, $variantPool->random(2), 'shipped', now()->subDays(3), 'TRACK-SHP002');
        $this->createOrder($customer, $variantPool->random(1), 'processing', now()->subDay());
        $this->createOrder($customer, $variantPool->random(3), 'paid', now());

        // ── A review left on the delivered order's product ──
        $deliveredOrder = Order::where('user_id', $customer->id)->where('status', 'delivered')->first();
        $reviewedProduct = $deliveredOrder->items->first()->variant->product;
        Review::create(['product_id' => $reviewedProduct->id, 'user_id' => $customer->id, 'rating' => 5, 'body' => 'Exactly as described, fast shipping. Would buy again.']);

        // ── A few more random reviews scattered across the catalog ──
        Product::inRandomOrder()->limit(5)->get()->each(function (Product $product) {
            Review::factory()->create(['product_id' => $product->id, 'user_id' => User::factory()->create()->id]);
        });

        $this->command?->info('Seeded a demo storefront: 6 categories, 8 products, '.$variantPool->count().' variants, 3 coupons, and a week of orders.');
    }

    protected function createOrder(User $buyer, $variants, string $status, CarbonInterface $date, ?string $tracking = null): Order
    {
        $subtotal = $variants->sum(fn (ProductVariant $v) => $v->effective_price);

        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'email' => $buyer->email,
            'recipient_name' => $buyer->name,
            'line1' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'country' => 'United States',
            'phone' => fake()->phoneNumber(),
            'shipping_method' => 'standard',
            'shipping_fee' => 5,
            'subtotal' => $subtotal,
            'discount' => 0,
            'total' => $subtotal + 5,
            'status' => $status,
            'payment_method' => 'simulated',
            'tracking_number' => $tracking,
            'paid_at' => in_array($status, ['paid', 'processing', 'shipped', 'delivered']) ? $date : null,
            'shipped_at' => in_array($status, ['shipped', 'delivered']) ? $date : null,
            'delivered_at' => $status === 'delivered' ? $date : null,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        foreach ($variants as $variant) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'variant_label' => $variant->label,
                'sku' => $variant->sku,
                'price' => $variant->effective_price,
                'quantity' => 1,
            ]);

            // Mirror what OrderService::markPaid() does for a real purchase, so a
            // seeded store looks like one that genuinely sold things: stock goes
            // down and sales_count goes up. Without this the admin dashboard's
            // "Top Products" panel would rank every product at zero sales.
            if (in_array($status, ['paid', 'processing', 'shipped', 'delivered'], true)) {
                $variant->decrement('stock_quantity', min(1, $variant->stock_quantity));
                $variant->product()->increment('sales_count');
            }
        }

        return $order;
    }
}
