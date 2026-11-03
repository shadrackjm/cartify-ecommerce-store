<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/reports/index');
    }

    public function sales(): StreamedResponse
    {
        $headers = ['Order Number', 'Date', 'Customer Email', 'Status', 'Subtotal', 'Discount', 'Shipping', 'Total'];

        return $this->streamCsv('sales.csv', $headers, function ($handle) {
            Order::orderBy('id')->chunk(200, function ($orders) use ($handle) {
                foreach ($orders as $order) {
                    fputcsv($handle, [
                        $order->order_number,
                        $order->created_at->toDateString(),
                        $order->email,
                        $order->status,
                        $order->subtotal,
                        $order->discount,
                        $order->shipping_fee,
                        $order->total,
                    ]);
                }
            });
        });
    }

    public function products(): StreamedResponse
    {
        $headers = ['Product', 'Category', 'Base Price', 'Variants', 'Total Stock', 'Sales Count'];

        return $this->streamCsv('products.csv', $headers, function ($handle) {
            Product::with(['category', 'variants'])->chunk(200, function ($products) use ($handle) {
                foreach ($products as $product) {
                    fputcsv($handle, [
                        $product->name,
                        $product->category?->name,
                        $product->base_price,
                        $product->variants->count(),
                        $product->variants->sum('stock_quantity'),
                        $product->sales_count,
                    ]);
                }
            });
        });
    }

    protected function streamCsv(string $filename, array $headers, callable $writeRows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $writeRows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            $writeRows($handle);
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
