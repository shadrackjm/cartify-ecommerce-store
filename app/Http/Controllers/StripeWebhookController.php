<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Stripe's own confirmation that a checkout session was actually paid.
     * This is the authoritative path — the browser-return handler in
     * CheckoutController is a convenience, but a customer closing their
     * tab before the redirect completes must never leave an order stuck
     * as pending forever. The webhook has no such gap.
     */
    public function handle(Request $request, OrderService $orders): Response
    {
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = $secret
                ? Webhook::constructEvent($request->getContent(), $request->header('Stripe-Signature'), $secret)
                : json_decode($request->getContent());
        } catch (\Exception) {
            return response('Invalid signature', 400);
        }

        if (($event->type ?? null) === 'checkout.session.completed') {
            $session = $event->data->object;
            $order = Order::find($session->metadata->order_id ?? null);

            if ($order) {
                $orders->markPaid($order, 'stripe', $session->id);
            }
        }

        return response('ok');
    }
}
