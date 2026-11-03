<?php

use App\Models\Address;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeStorefront(): array
{
    $category = Category::create(['name' => 'Apparel', 'slug' => 'apparel']);
    $product = Product::create([
        'category_id' => $category->id, 'name' => 'Classic Tee', 'slug' => 'classic-tee',
        'description' => 'A tee.', 'base_price' => 20,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'TEE-BLK-M', 'size' => 'M', 'color' => 'Black', 'stock_quantity' => 5,
    ]);
    $customer = User::factory()->create(['role' => 'customer']);
    $admin = User::factory()->create(['role' => 'admin']);
    Address::factory()->create(['user_id' => $customer->id]);

    return compact('category', 'product', 'variant', 'customer', 'admin');
}

test('guests can browse the shop and a product page', function () {
    $shop = makeStorefront();

    $this->get('/shop')->assertOk();
    $this->get("/products/{$shop['product']->slug}")->assertOk();
});

test('the landing page shows real best sellers and categories', function () {
    $shop = makeStorefront();
    $shop['product']->increment('sales_count', 3);

    $this->get(route('home'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->where('featured.0.name', 'Classic Tee')
        ->where('featured.0.in_stock', true)
        ->where('categories.0.slug', 'apparel')
        ->where('categories.0.products_count', 1)
    );
});

test('the landing page ranks featured products by real sales', function () {
    $shop = makeStorefront();
    $bestSeller = Product::create([
        'category_id' => $shop['category']->id, 'name' => 'Fleece Hoodie', 'slug' => 'fleece-hoodie',
        'description' => 'A hoodie.', 'base_price' => 45,
    ]);

    // `sales_count` is deliberately not mass-assignable — only a real sale moves
    // it — so bump it the same way OrderService::markPaid() does.
    $bestSeller->increment('sales_count', 99);

    $this->get(route('home'))->assertOk()->assertInertia(
        fn ($page) => $page->where('featured.0.id', $bestSeller->id)
    );
});

test('adding to cart clamps quantity to available stock', function () {
    $shop = makeStorefront();

    $this->post("/cart/{$shop['variant']->id}", ['quantity' => 50])->assertRedirect();

    $this->get('/cart')->assertInertia(fn ($page) => $page->where('summary.items.0.quantity', 5));
});

test('checkout requires authentication', function () {
    $this->get('/checkout')->assertRedirect(route('login'));
});

test('placing an order decrements stock, clears the cart, and marks the coupon used', function () {
    $shop = makeStorefront();
    Coupon::create(['code' => 'SAVE10', 'type' => 'percent', 'value' => 10, 'is_active' => true]);

    $this->actingAs($shop['customer']);
    $this->post("/cart/{$shop['variant']->id}", ['quantity' => 2]);
    $this->post('/cart/coupon', ['code' => 'SAVE10']);

    $address = $shop['customer']->addresses()->first();

    $response = $this->post('/checkout', [
        'address_id' => $address->id,
        'shipping_method' => 'standard',
    ]);

    $order = Order::where('user_id', $shop['customer']->id)->first();
    $response->assertRedirect(route('checkout.success', $order));

    expect($order->status)->toBe('paid');
    expect($order->subtotal)->toEqual('40.00');
    expect($order->discount)->toEqual('4.00');
    expect($shop['variant']->fresh()->stock_quantity)->toBe(3);
    expect($shop['product']->fresh()->sales_count)->toBe(2);
    expect(Coupon::where('code', 'SAVE10')->value('used_count'))->toBe(1);

    $this->get('/cart')->assertInertia(fn ($page) => $page->where('summary.items', []));
});

test('a customer cannot view another customers order', function () {
    $shop = makeStorefront();
    $intruder = User::factory()->create(['role' => 'customer']);

    $order = Order::create([
        'user_id' => $shop['customer']->id, 'order_number' => 'ORD-TEST0001', 'email' => $shop['customer']->email,
        'recipient_name' => 'Test', 'line1' => '1 Main St', 'city' => 'City', 'postal_code' => '00000', 'country' => 'US',
        'shipping_method' => 'standard', 'shipping_fee' => 5, 'subtotal' => 20, 'total' => 25, 'status' => 'paid',
    ]);

    $this->actingAs($intruder);
    $this->get("/orders/{$order->id}")->assertForbidden();
});

// Product and Category resolve routes by slug, which is right for the public
// catalog URL and wrong for every button that already holds the record and
// sends its id. These cover the action routes that must accept an id.
test('admin can reach a product edit screen by id', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['admin']);

    $this->get("/admin/products/{$shop['product']->id}/edit")->assertOk();
});

test('admin product and category actions accept ids', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['admin']);

    $this->patch("/admin/products/{$shop['product']->id}", [
        'category_id' => $shop['category']->id,
        'name' => 'Renamed Tee',
        'base_price' => 25,
    ])->assertRedirect();

    $this->post("/admin/products/{$shop['product']->id}/variants", [
        'sku' => 'TEE-WHT-L',
        'stock_quantity' => 3,
    ])->assertRedirect();

    $this->patch("/admin/categories/{$shop['category']->id}", ['name' => 'Renamed'])->assertRedirect();

    expect($shop['product']->fresh()->name)->toBe('Renamed Tee');
    expect($shop['product']->variants()->count())->toBe(2);
    expect($shop['category']->fresh()->name)->toBe('Renamed');
});

test('the wishlist accepts a product id', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['customer']);

    $this->post("/wishlist/{$shop['product']->id}")->assertRedirect();
    expect($shop['customer']->wishlists()->count())->toBe(1);

    $this->delete("/wishlist/{$shop['product']->id}")->assertRedirect();
    expect($shop['customer']->wishlists()->count())->toBe(0);
});

test('non-admin customers are blocked from the admin area', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['customer']);

    $this->get('/admin/dashboard')->assertForbidden();
    $this->get('/admin/products')->assertForbidden();
});

test('admin can manage the admin area', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['admin']);

    $this->get('/admin/dashboard')->assertOk();
    $this->get('/admin/products')->assertOk();
    $this->get('/admin/categories')->assertOk();
    $this->get('/admin/orders')->assertOk();
    $this->get('/admin/coupons')->assertOk();
    $this->get('/admin/reports')->assertOk();
});

test('a review can only be left after the order is delivered', function () {
    $shop = makeStorefront();
    $this->actingAs($shop['customer']);

    $order = Order::create([
        'user_id' => $shop['customer']->id, 'order_number' => 'ORD-TEST0002', 'email' => $shop['customer']->email,
        'recipient_name' => 'Test', 'line1' => '1 Main St', 'city' => 'City', 'postal_code' => '00000', 'country' => 'US',
        'shipping_method' => 'standard', 'shipping_fee' => 5, 'subtotal' => 20, 'total' => 25, 'status' => 'paid',
    ]);
    OrderItem::create([
        'order_id' => $order->id, 'product_variant_id' => $shop['variant']->id, 'product_name' => 'Classic Tee',
        'sku' => 'TEE-BLK-M', 'price' => 20, 'quantity' => 1,
    ]);

    $this->post("/products/{$shop['product']->slug}/reviews", ['rating' => 5])->assertForbidden();

    $order->update(['status' => 'delivered']);

    $this->post("/products/{$shop['product']->slug}/reviews", ['rating' => 5, 'body' => 'Great!'])->assertRedirect();
    expect(Review::where('product_id', $shop['product']->id)->count())->toBe(1);

    // Reviewing again updates the same row rather than creating a second one.
    $this->post("/products/{$shop['product']->slug}/reviews", ['rating' => 3, 'body' => 'Actually, meh.'])->assertRedirect();
    expect(Review::where('product_id', $shop['product']->id)->count())->toBe(1);
    expect(Review::first()->rating)->toBe(3);
});
