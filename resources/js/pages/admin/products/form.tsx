import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import type { Product, ProductVariant } from '@/types';

interface CategoryOption {
    id: number;
    name: string;
}

interface Props {
    categories: CategoryOption[];
    product: (Product & { variants: ProductVariant[] }) | null;
}

export default function ProductForm({ categories, product }: Props) {
    const form = useForm({
        category_id: product?.category_id ? String(product.category_id) : '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        base_price: product?.base_price ?? '',
        is_published: product?.is_published ?? true,
        cover_image: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        if (product) {
            form.patch(`/admin/products/${product.id}`, {
                onSuccess: () => toast.success('Product saved.'),
            });
        } else {
            form.post('/admin/products', {
                onSuccess: () => toast.success('Product created.'),
            });
        }
    }

    return (
        <>
            <Head title={product ? `Edit ${product.name}` : 'Add Product'} />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    {product ? `Edit ${product.name}` : 'Add Product'}
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-xl border p-6"
                >
                    <div>
                        <Label htmlFor="p-name">Name</Label>
                        <Input
                            id="p-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div>
                        <Label>Category</Label>
                        <Select
                            value={form.data.category_id || 'none'}
                            onValueChange={(value) =>
                                form.setData(
                                    'category_id',
                                    value === 'none' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Uncategorised
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="p-desc">Description</Label>
                        <textarea
                            id="p-desc"
                            rows={4}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        />
                    </div>

                    <div>
                        <Label htmlFor="p-price">Base price</Label>
                        <Input
                            id="p-price"
                            type="number"
                            step="0.01"
                            value={form.data.base_price}
                            onChange={(e) =>
                                form.setData('base_price', e.target.value)
                            }
                        />
                        <InputError message={form.errors.base_price} />
                    </div>

                    <div>
                        <Label htmlFor="p-cover">Cover image</Label>
                        {product?.cover_url && (
                            <img
                                src={product.cover_url}
                                alt=""
                                className="mb-2 h-24 w-24 rounded-md object-cover"
                            />
                        )}
                        <Input
                            id="p-cover"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                form.setData(
                                    'cover_image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={form.errors.cover_image} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="p-published"
                            checked={form.data.is_published}
                            onCheckedChange={(checked) =>
                                form.setData('is_published', checked === true)
                            }
                        />
                        <Label
                            htmlFor="p-published"
                            className="cursor-pointer font-normal"
                        >
                            Published (visible in the shop)
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving…'
                                : product
                                  ? 'Save Product'
                                  : 'Create Product'}
                        </Button>
                    </div>
                </form>

                {product ? (
                    <VariantsManager product={product} />
                ) : (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Save the product first, then come back here to add
                        variants.
                    </p>
                )}
            </div>
        </>
    );
}

const emptyVariant = {
    sku: '',
    size: '',
    color: '',
    price: '',
    stock_quantity: '0',
    image: null as File | null,
};

function VariantsManager({
    product,
}: {
    product: Product & { variants: ProductVariant[] };
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<ProductVariant | null>(null);

    const createForm = useForm({ ...emptyVariant });
    const editForm = useForm({ ...emptyVariant });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post(`/admin/products/${product.id}/variants`, {
            onSuccess: () => {
                toast.success('Variant added.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(variant: ProductVariant) {
        setEditing(variant);
        editForm.setData({
            sku: variant.sku,
            size: variant.size ?? '',
            color: variant.color ?? '',
            price: variant.price ?? '',
            stock_quantity: String(variant.stock_quantity),
            image: null,
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.patch(`/admin/variants/${editing.id}`, {
            onSuccess: () => {
                toast.success('Variant updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(variant: ProductVariant) {
        if (!confirm(`Delete variant "${variant.sku}"?`)) {
            return;
        }

        router.delete(`/admin/variants/${variant.id}`, {
            onSuccess: () => toast.success('Variant removed.'),
        });
    }

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Variants</h2>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Variant
                </Button>
            </div>

            {product.variants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No variants yet — every sellable product needs at least one,
                    even a lone "Default".
                </p>
            ) : (
                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    SKU
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Size
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Color
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Price Override
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Stock
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {product.variants.map((variant) => (
                                <tr
                                    key={variant.id}
                                    className="hover:bg-muted/20"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {variant.sku}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {variant.size ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {variant.color ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {variant.price
                                            ? `$${variant.price}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span
                                            className={
                                                variant.stock_quantity <= 5
                                                    ? 'font-medium text-amber-600'
                                                    : ''
                                            }
                                        >
                                            {variant.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEdit(variant)
                                                }
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(variant)
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
                        <DialogTitle>Add Variant</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <VariantFields form={createForm} idPrefix="v" />
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
                                {createForm.processing ? 'Adding…' : 'Add'}
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
                        <DialogTitle>Edit Variant</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <VariantFields form={editForm} idPrefix="ve" />
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
        </div>
    );
}

function VariantFields({
    form,
    idPrefix,
}: {
    form: ReturnType<typeof useForm<typeof emptyVariant>>;
    idPrefix: string;
}) {
    return (
        <>
            <div>
                <Label htmlFor={`${idPrefix}-sku`}>SKU</Label>
                <Input
                    id={`${idPrefix}-sku`}
                    value={form.data.sku}
                    onChange={(e) => form.setData('sku', e.target.value)}
                />
                <InputError message={form.errors.sku} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-size`}>Size (optional)</Label>
                    <Input
                        id={`${idPrefix}-size`}
                        value={form.data.size}
                        onChange={(e) => form.setData('size', e.target.value)}
                        placeholder="M"
                    />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-color`}>
                        Color (optional)
                    </Label>
                    <Input
                        id={`${idPrefix}-color`}
                        value={form.data.color}
                        onChange={(e) => form.setData('color', e.target.value)}
                        placeholder="Black"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-price`}>Price override</Label>
                    <Input
                        id={`${idPrefix}-price`}
                        type="number"
                        step="0.01"
                        value={form.data.price}
                        onChange={(e) => form.setData('price', e.target.value)}
                        placeholder="Uses base price if blank"
                    />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-stock`}>Stock quantity</Label>
                    <Input
                        id={`${idPrefix}-stock`}
                        type="number"
                        value={form.data.stock_quantity}
                        onChange={(e) =>
                            form.setData('stock_quantity', e.target.value)
                        }
                    />
                    <InputError message={form.errors.stock_quantity} />
                </div>
            </div>
            <div>
                <Label htmlFor={`${idPrefix}-image`}>
                    Variant image (optional)
                </Label>
                <Input
                    id={`${idPrefix}-image`}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        form.setData('image', e.target.files?.[0] ?? null)
                    }
                />
            </div>
        </>
    );
}
