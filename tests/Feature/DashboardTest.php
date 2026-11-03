<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

/*
 * Cartify has no customer "dashboard" page of its own — DashboardController
 * routes each role to the screen that already answers their first question.
 * So the assertion here is a redirect, not a 200.
 */
test('customers are sent to their order history', function () {
    $this->actingAs(User::factory()->create(['role' => 'customer']));

    $this->get(route('dashboard'))->assertRedirect(route('orders.index'));
});

test('admins are sent to the admin dashboard', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));

    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});
