<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\SalesDiscount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function index()
    {
        $discounts = Discount::with(['product', 'salesDiscounts'])
            ->withCount('salesDiscounts as total_used')
            ->latest()
            ->get();

        return response()->json($discounts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:m_products,id',
            'discount'   => 'required|numeric|min:0.1|max:100',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $discount = Discount::create([
            'product_id' => $validated['product_id'],
            'discount'   => $validated['discount'],
        ]);

        // Simpan rentang tanggal ketersediaan
        SalesDiscount::create([
            'sales_id'    => null, // Pastikan kolom sales_id di migrasi sudah nullable
            'discount_id' => $discount->id,
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
        ]);

        return response()->json(['message' => 'Diskon berhasil ditambahkan']);
    }

    public function update(Request $request, $id)
    {
        $discount = Discount::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'required|exists:m_products,id',
            'discount'   => 'required|numeric|min:0.1|max:100',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $discount->update([
            'product_id' => $validated['product_id'],
            'discount'   => $validated['discount'],
        ]);

        // Update rentang tanggal ketersediaan
        SalesDiscount::where('discount_id', $discount->id)
            ->whereNull('sales_id')
            ->update([
                'start_date' => $validated['start_date'],
                'end_date'   => $validated['end_date'],
            ]);

        return response()->json(['message' => 'Diskon berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $discount = Discount::findOrFail($id);
        $discount->delete();
        return response()->json(['message' => 'Diskon berhasil dihapus']);
    }

    public function usedDiscounts()
    {
        $used = SalesDiscount::with(['sale.product', 'discount'])
            ->whereNotNull('sales_id')
            ->latest()
            ->get();

        return response()->json($used);
    }
}