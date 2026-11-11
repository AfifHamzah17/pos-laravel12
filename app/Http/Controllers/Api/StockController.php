<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index()
    {
        return response()->json(Stock::with('product')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:m_products,id',
            'qty'        => 'required|integer|min:1', // Pengadaan stok harus > 0
        ]);

        DB::transaction(function () use ($validated) {
            Stock::create($validated);
            // Tambahkan jumlah stok ke master produk
            $product = Product::findOrFail($validated['product_id']);
            $product->increment('stock', $validated['qty']);
        });

        return response()->json(['message' => 'Pengadaan stok berhasil ditambahkan']);
    }
}