import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
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
import type { Address } from '@/types';

interface Props {
    addresses: Address[];
}

const emptyForm = {
    label: 'Home',
    recipient_name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false,
};

export default function AddressesIndex({ addresses }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/addresses', {
            onSuccess: () => {
                toast.success('Address added.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(address: Address) {
        setEditing(address);
        editForm.setData({
            label: address.label,
            recipient_name: address.recipient_name,
            line1: address.line1,
            line2: address.line2 ?? '',
            city: address.city,
            state: address.state ?? '',
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone ?? '',
            is_default: address.is_default,
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.patch(`/addresses/${editing.id}`, {
            onSuccess: () => {
                toast.success('Address updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(address: Address) {
        if (!confirm(`Delete the "${address.label}" address?`)) {
            return;
        }

        router.delete(`/addresses/${address.id}`, {
            onSuccess: () => toast.success('Address removed.'),
        });
    }

    return (
        <>
            <Head title="Addresses" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Your Addresses</h1>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                    <MapPin className="mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="font-semibold">No addresses yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add one to be able to check out.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <div key={address.id} className="rounded-xl border p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-semibold">
                                    {address.label}{' '}
                                    {address.is_default && (
                                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                            Default
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(address)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm">{address.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {address.line1}, {address.city}, {address.state}{' '}
                                {address.postal_code}, {address.country}
                            </p>
                        </div>
                    ))}
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
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <AddressFields form={createForm} idPrefix="a" />
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
                                {createForm.processing ? 'Saving…' : 'Save'}
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
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <AddressFields form={editForm} idPrefix="ae" />
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

function AddressFields({
    form,
    idPrefix,
}: {
    form: ReturnType<typeof useForm<typeof emptyForm>>;
    idPrefix: string;
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-label`}>Label</Label>
                    <Input
                        id={`${idPrefix}-label`}
                        value={form.data.label}
                        onChange={(e) => form.setData('label', e.target.value)}
                    />
                    <InputError message={form.errors.label} />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-name`}>Recipient name</Label>
                    <Input
                        id={`${idPrefix}-name`}
                        value={form.data.recipient_name}
                        onChange={(e) =>
                            form.setData('recipient_name', e.target.value)
                        }
                    />
                    <InputError message={form.errors.recipient_name} />
                </div>
            </div>
            <div>
                <Label htmlFor={`${idPrefix}-line1`}>Address line 1</Label>
                <Input
                    id={`${idPrefix}-line1`}
                    value={form.data.line1}
                    onChange={(e) => form.setData('line1', e.target.value)}
                />
                <InputError message={form.errors.line1} />
            </div>
            <div>
                <Label htmlFor={`${idPrefix}-line2`}>Address line 2</Label>
                <Input
                    id={`${idPrefix}-line2`}
                    value={form.data.line2}
                    onChange={(e) => form.setData('line2', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-city`}>City</Label>
                    <Input
                        id={`${idPrefix}-city`}
                        value={form.data.city}
                        onChange={(e) => form.setData('city', e.target.value)}
                    />
                    <InputError message={form.errors.city} />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-state`}>State</Label>
                    <Input
                        id={`${idPrefix}-state`}
                        value={form.data.state}
                        onChange={(e) => form.setData('state', e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-postal`}>Postal code</Label>
                    <Input
                        id={`${idPrefix}-postal`}
                        value={form.data.postal_code}
                        onChange={(e) =>
                            form.setData('postal_code', e.target.value)
                        }
                    />
                    <InputError message={form.errors.postal_code} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`${idPrefix}-country`}>Country</Label>
                    <Input
                        id={`${idPrefix}-country`}
                        value={form.data.country}
                        onChange={(e) =>
                            form.setData('country', e.target.value)
                        }
                    />
                    <InputError message={form.errors.country} />
                </div>
                <div>
                    <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
                    <Input
                        id={`${idPrefix}-phone`}
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox
                    id={`${idPrefix}-default`}
                    checked={form.data.is_default}
                    onCheckedChange={(checked) =>
                        form.setData('is_default', checked === true)
                    }
                />
                <Label
                    htmlFor={`${idPrefix}-default`}
                    className="cursor-pointer font-normal"
                >
                    Set as default address
                </Label>
            </div>
        </>
    );
}
