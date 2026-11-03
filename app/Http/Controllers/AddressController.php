<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('addresses/index', [
            'addresses' => $request->user()->addresses()->orderByDesc('is_default')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $user = $request->user();

        DB::transaction(function () use ($user, $data) {
            if (! empty($data['is_default']) || $user->addresses()->count() === 0) {
                $user->addresses()->update(['is_default' => false]);
                $data['is_default'] = true;
            }

            $user->addresses()->create($data);
        });

        return back();
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $data = $this->validated($request);

        DB::transaction(function () use ($request, $address, $data) {
            if (! empty($data['is_default'])) {
                $request->user()->addresses()->update(['is_default' => false]);
            }

            $address->update($data);
        });

        return back();
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $address->delete();

        return back();
    }

    protected function validated(Request $request): array
    {
        return $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_default' => ['boolean'],
        ]);
    }
}
