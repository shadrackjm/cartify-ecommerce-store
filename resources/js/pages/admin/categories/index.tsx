import { Head, router, useForm } from '@inertiajs/react';
import { ListTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import type { Category } from '@/types';

interface Props {
    categories: Category[];
}

const emptyForm = { name: '', parent_id: '' };

export default function AdminCategoriesIndex({ categories }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/admin/categories', {
            onSuccess: () => {
                toast.success('Category created.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(category: Category) {
        setEditing(category);
        editForm.setData({
            name: category.name,
            parent_id: category.parent_id ? String(category.parent_id) : '',
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.patch(`/admin/categories/${editing.id}`, {
            onSuccess: () => {
                toast.success('Category updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(category: Category) {
        if (
            !confirm(
                `Delete "${category.name}"? Its products will become uncategorised.`,
            )
        ) {
            return;
        }

        router.delete(`/admin/categories/${category.id}`, {
            onSuccess: () => toast.success('Category deleted.'),
        });
    }

    return (
        <>
            <Head title="Categories" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>

                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <ListTree className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No categories yet</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Parent
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Products
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {category.parent?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {category.products_count ?? 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEdit(category)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(category)
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
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <CategoryFields
                            form={createForm}
                            categories={categories}
                            idPrefix="c"
                        />
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
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <CategoryFields
                            form={editForm}
                            categories={categories.filter(
                                (c) => c.id !== editing?.id,
                            )}
                            idPrefix="ce"
                        />
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

function CategoryFields({
    form,
    categories,
    idPrefix,
}: {
    form: ReturnType<typeof useForm<typeof emptyForm>>;
    categories: Category[];
    idPrefix: string;
}) {
    return (
        <>
            <div>
                <Label htmlFor={`${idPrefix}-name`}>Name</Label>
                <Input
                    id={`${idPrefix}-name`}
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    autoFocus
                />
                <InputError message={form.errors.name} />
            </div>
            <div>
                <Label>Parent category (optional)</Label>
                <Select
                    value={form.data.parent_id || 'none'}
                    onValueChange={(value) =>
                        form.setData('parent_id', value === 'none' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            No parent (top-level)
                        </SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={form.errors.parent_id} />
            </div>
        </>
    );
}
