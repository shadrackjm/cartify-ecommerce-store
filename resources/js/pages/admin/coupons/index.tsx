import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Coupon } from '@/types';

interface Props {
    coupons: Coupon[];
}

const emptyForm = {
    code: '',
    type: 'percent',
    value: '',
    max_uses: '',
    expires_at: '',
    is_active: true,
};

export default function AdminCouponsIndex({ coupons }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/admin/coupons', {
            onSuccess: () => {
                toast.success('Coupon created.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(coupon: Coupon) {
        setEditing(coupon);
        editForm.setData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
            expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
            is_active: coupon.is_active,
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.patch(`/admin/coupons/${editing.id}`, {
            onSuccess: () => {
                toast.success('Coupon updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(coupon: Coupon) {
        if (!confirm(`Delete coupon "${coupon.code}"?`)) {
            return;
        }

        router.delete(`/admin/coupons/${coupon.id}`, {
            onSuccess: () => toast.success('Coupon deleted.'),
        });
    }

    return (
        <>
            <Head title="Coupons" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Coupons</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Coupon
                    </Button>
                </div>

                {coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <Tag className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No coupons yet</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Code
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Discount
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Used
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Expires
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {coupons.map((coupon) => (
                                    <tr
                                        key={coupon.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {coupon.code}
                                        </td>
                                        <td className="px-4 py-3">
                                            {coupon.type === 'percent'
                                                ? `${coupon.value}%`
                                                : `$${coupon.value}`}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {coupon.used_count}
                                            {coupon.max_uses
                                                ? ` / ${coupon.max_uses}`
                                                : ''}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {coupon.expires_at
                                                ? coupon.expires_at.slice(0, 10)
                                                : 'Never'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${coupon.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                {coupon.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEdit(coupon)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(coupon)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog
                open={showCreate}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCreate(false);
                        createForm.reset();
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Coupon</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <CouponFields form={createForm} idPrefix="c" />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowCreate(false);
                                    createForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                {createForm.processing ? 'Creating…' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!editing}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditing(null);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Coupon</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <CouponFields form={editForm} idPrefix="ce" />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CouponFields({
    form,
    idPrefix,
}: {
    form: ReturnType<typeof useForm<typeof emptyForm>>;
    idPrefix: string;
}) {
    return (
        <>
            <div>
                <Label htmlFor={`${idPrefix}-code`}>Code</Label>
                <Input
                    id={`${idPrefix}-code`}
                    value={form.data.code}
                    onChange={(e) =>
                        form.setData('code', e.target.value.toUpperCase())
                    }
                />
                <InputError message={form.errors.code} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Type</Label>
                    <Select
                        value={form.data.type}
                        onValueChange={(value) => form.setData('type', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percent">Percent</SelectItem>
                            <SelectItem value="fixed">Fixed amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-value`}>Value</Label>
                    <Input
                        id={`${idPrefix}-value`}
                        type="number"
                        step="0.01"
                        value={form.data.value}
                        onChange={(e) => form.setData('value', e.target.value)}
                    />
                    <InputError message={form.errors.value} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-max`}>Max uses</Label>
                    <Input
                        id={`${idPrefix}-max`}
                        type="number"
                        value={form.data.max_uses}
                        onChange={(e) =>
                            form.setData('max_uses', e.target.value)
                        }
                        placeholder="Unlimited"
                    />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-expires`}>Expires</Label>
                    <Input
                        id={`${idPrefix}-expires`}
                        type="date"
                        value={form.data.expires_at}
                        onChange={(e) =>
                            form.setData('expires_at', e.target.value)
                        }
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox
                    id={`${idPrefix}-active`}
                    checked={form.data.is_active}
                    onCheckedChange={(checked) =>
                        form.setData('is_active', checked === true)
                    }
                />
                <Label
                    htmlFor={`${idPrefix}-active`}
                    className="cursor-pointer font-normal"
                >
                    Active
                </Label>
            </div>
        </>
    );
}
