<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SaleController extends Controller
{
    public function index()
    {
        return response()->json(Sale::with(['product', 'discounts'])->latest()->get());
    }

    public function store(Request $request)
    {
        // 1. Tangkap tanggal transaksi dari form. Jika diisi, parse ke Carbon; jika kosong, pakai waktu sekarang.
        $transDate = $request->filled('transaction_date') 
            ? Carbon::parse($request->transaction_date) 
            : Carbon::now();

        // 2. Validasi Input Form
        $validated = $request->validate([
            'product_id'       => 'required|exists:m_products,id',
            'qty'              => 'required|integer|min:1',
            'transaction_date' => 'nullable|date',
        ], [
            'product_id.exists' => 'Produk tidak ditemukan di database.',
        ]);

        // Cek apakah tanggal transaksi yang dipilih melebihi waktu saat ini
        if ($transDate->isFuture()) {
            return response()->json([
                'message' => 'Waktu transaksi tidak boleh melebihi saat ini!'
            ], 422);
        }

        $product = Product::findOrFail($validated['product_id']);

        // 3. Validasi Stok Cukup
        if ($product->stock < $validated['qty']) {
            return response()->json([
                'message' => "Stok produk tidak mencukupi! (Tersedia: {$product->stock}, Diminta: {$validated['qty']})"
            ], 422);
        }

        // 4. Generate Unique Transaction Code
        $dateCode   = $transDate->format('Ymd');
        $randomCode = strtoupper(Str::random(5));
        $trxCode    = "TRX-{$dateCode}-PRD{$product->id}-{$randomCode}";

        DB::transaction(function () use ($product, $validated, $transDate, $trxCode) {
            // Kurangi Stok Produk
            $product->decrement('stock', $validated['qty']);

            // Buat Record Penjualan dengan created_at dipaksa menggunakan $transDate dari form
            $sale = new Sale();
            $sale->trx_code   = $trxCode;
            $sale->product_id = $product->id;
            $sale->qty        = $validated['qty'];
            $sale->created_at = $transDate;
            $sale->updated_at = $transDate;
            $sale->save();

            // Cek Diskon Otomatis yang Aktif pada Tanggal Transaksi
            $activeDiscount = Discount::where('product_id', $product->id)
                ->whereHas('salesDiscounts', function ($query) use ($transDate) {
                    $query->where('start_date', '<=', $transDate)
                          ->where('end_date', '>=', $transDate);
                })
                ->first();

            if ($activeDiscount) {
                $sale->discounts()->attach($activeDiscount->id, [
                    'start_date' => $transDate,
                    'end_date'   => $transDate,
                ]);
            }
        });

        return response()->json([
            'message'  => 'Transaksi penjualan berhasil disimpan',
            'trx_code' => $trxCode,
        ], 201);
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);

        DB::transaction(function () use ($sale) {
            if ($sale->product) {
                $sale->product->increment('stock', $sale->qty);
            }
            $sale->delete();
        });

        return response()->json(['message' => 'Transaksi penjualan berhasil dihapus & stok dikembalikan']);
    }
}