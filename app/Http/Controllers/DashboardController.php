<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * There is no customer "dashboard" distinct from their order history —
     * rather than build a redundant page, we simply route each role to the
     * screen that already answers their most common question.
     */
    public function index(Request $request): RedirectResponse
    {
        return $request->user()->hasRole('admin')
            ? to_route('admin.dashboard')
            : to_route('orders.index');
    }
}
