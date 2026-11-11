<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Discount;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        return response()->json(Product::withSum('stocks as current_stock', 'qty')->latest()->get());
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated =$request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan', 
            'data'    => $product
        ], 201);
    }

    /**
     * Display the specified product with active discount details.
     */
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        $now = Carbon::now();

        // Cari diskon aktif berdasarkan waktu/tanggal saat ini
        $activeDiscount = Discount::where('product_id',$product->id)
            ->whereHas('salesDiscounts', function ($query) use ($now) {
                $query->where('start_date', '<=',$now)
                      ->where('end_date', '>=', $now);
            })
            ->first();

        $decimalDiscount    = $activeDiscount ? (float) $activeDiscount->discount : 0;
        $discountPercentage =$decimalDiscount * 100;

        $discountAmount     = (float) $product->price * $decimalDiscount;
        $finalPrice         = (float) $product->price -$discountAmount;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                => $product->id,
                'name'              => $product->name,
                'description'       => $product->description ?? '-',
                'price'             => (float) $product->price,
                'formatted_price'   => 'Rp ' . number_format($product->price, 0, ',', '.'), 'stock'             => (int)$product->stock,
                'discount'          => [
                    'is_active'           => !is_null($activeDiscount),
                    'discount_value'      => $decimalDiscount,
                    'discount_percentage' => $discountPercentage,
                    'discount_amount'     => $discountAmount,
                    'formatted_discount'  => $discountPercentage > 0 ? "{$discountPercentage}%" : '0%',
                ],
                'final_price'           => $finalPrice,
                'formatted_final_price' => 'Rp ' . number_format($finalPrice, 0, ',', '.'), 'created_at'            =>$product->created_at,
                'updated_at'            => $product->updated_at,
            ]
        ], 200);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request,$id)
    {
        $product = Product::findOrFail($id);

        $validated =$request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diubah', 
            'data'    => $product
        ]);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);$product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }
}