import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminReportsIndex() {
    return (
        <>
            <Head title="Reports" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">Reports</h1>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border p-5">
                        <p className="font-semibold">Sales report</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Every order, its status, and its totals.
                        </p>
                        <Button className="mt-4" asChild>
                            <a href="/admin/reports/sales.csv">
                                <Download className="mr-2 h-4 w-4" /> Export
                                sales.csv
                            </a>
                        </Button>
                    </div>

                    <div className="rounded-xl border p-5">
                        <p className="font-semibold">Product report</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Every product, its stock, and units sold.
                        </p>
                        <Button className="mt-4" asChild>
                            <a href="/admin/reports/products.csv">
                                <Download className="mr-2 h-4 w-4" /> Export
                                products.csv
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
