<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

// ── Public storefront ────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// ── Session cart — works for guests too ─────────────────────────────────────
Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon.store');
Route::delete('cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.destroy');
Route::post('cart/{variant}', [CartController::class, 'store'])->name('cart.store');
Route::patch('cart/{variant}', [CartController::class, 'update'])->name('cart.update');
Route::delete('cart/{variant}', [CartController::class, 'destroy'])->name('cart.destroy');

// ── Stripe, unauthenticated and CSRF-excluded ────────────────────────────────
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('checkout/{order}/success', [CheckoutController::class, 'success'])->name('checkout.success');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::patch('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');

    // `{product:id}` on every action route, because Product's route key is its
    // slug — great for the public catalog URL, wrong for a button that already
    // has the record in hand and sends its id.
    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('wishlist/{product:id}', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('wishlist/{product:id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

    Route::post('products/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // ── Admin area ───────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::patch('categories/{category:id}', [AdminCategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category:id}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('products', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('products/{product:id}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::patch('products/{product:id}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product:id}', [AdminProductController::class, 'destroy'])->name('products.destroy');

        Route::post('products/{product:id}/variants', [ProductVariantController::class, 'store'])->name('variants.store');
        Route::patch('variants/{variant}', [ProductVariantController::class, 'update'])->name('variants.update');
        Route::delete('variants/{variant}', [ProductVariantController::class, 'destroy'])->name('variants.destroy');

        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');

        Route::get('coupons', [AdminCouponController::class, 'index'])->name('coupons.index');
        Route::post('coupons', [AdminCouponController::class, 'store'])->name('coupons.store');
        Route::patch('coupons/{coupon}', [AdminCouponController::class, 'update'])->name('coupons.update');
        Route::delete('coupons/{coupon}', [AdminCouponController::class, 'destroy'])->name('coupons.destroy');

        Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('reports/sales.csv', [AdminReportController::class, 'sales'])->name('reports.sales');
        Route::get('reports/products.csv', [AdminReportController::class, 'products'])->name('reports.products');
    });
});

require __DIR__.'/settings.php';
