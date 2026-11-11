<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\SalesDiscount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    /**
     * Display a listing of discounts with product details and real usage count.
     */
    public function index()
    {
        $discounts = Discount::with(['product', 'salesDiscounts'])
            // Hanya hitung penggunaan diskon jika sales_id TIDAK NULL (transaksi benar-benar terjadi)
            ->withCount(['salesDiscounts as total_used' => function ($query) {$query->whereNotNull('sales_id');
            }])
            ->latest()
            ->get()
            ->map(function ($discount) {
                $discount->discount_percentage = (float)$discount->discount * 100;
                return $discount;
            });

        return response()->json($discounts);
    }

    /**
     * Store a newly created discount in storage.
     */
    public function store(Request $request)
    {
        $validated =$request->validate([
            'product_id' => 'required|exists:m_products,id',
            'discount'   => 'required|numeric|min:0.1|max:100', // Input persentase (misal: 20)
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        // Konversi persentase ke desimal float (20% -> 0.20)
        $decimalDiscount = (float)$validated['discount'] / 100;

        $discount = Discount::create([
            'product_id' => $validated['product_id'],
            'discount'   => $decimalDiscount,
        ]);

        // Simpan rentang tanggal ketersediaan promo (sales_id default null)
        SalesDiscount::create([
            'sales_id'    => null,
            'discount_id' => $discount->id,
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
        ]);

        return response()->json([
            'message' => 'Diskon berhasil ditambahkan',
            'data'    => $discount
        ], 201);
    }

    /**
     * Update the specified discount in storage.
     */
    public function update(Request $request,$id)
    {
        $discount = Discount::findOrFail($id);

        $validated =$request->validate([
            'product_id' => 'required|exists:m_products,id',
            'discount'   => 'required|numeric|min:0.1|max:100',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $decimalDiscount = (float)$validated['discount'] / 100;

        $discount->update([
            'product_id' => $validated['product_id'],
            'discount'   => $decimalDiscount,
        ]);

        // Update rentang tanggal ketersediaan promo
        SalesDiscount::where('discount_id', $discount->id)
            ->whereNull('sales_id')
            ->update([
                'start_date' => $validated['start_date'],
                'end_date'   => $validated['end_date'],
            ]);

        return response()->json([
            'message' => 'Diskon berhasil diperbarui',
            'data'    => $discount
        ]);
    }

    /**
     * Remove the specified discount from storage.
     */
    public function destroy($id)
    {
        $discount = Discount::findOrFail($id);$discount->delete();

        return response()->json(['message' => 'Diskon berhasil dihapus']);
    }

    /**
     * Display a listing of used discounts.
     */
    public function usedDiscounts()
    {
        $used = SalesDiscount::with(['sale.product', 'discount'])
            ->whereNotNull('sales_id')
            ->latest()
            ->get();

        return response()->json($used);
    }
}