<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Discount;
use App\Models\SalesDiscount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SaleController extends Controller
{
    /**
     * Display a listing of sales transactions with product and discount relations.
     */
    public function index()
    {
        return response()->json(
            Sale::with(['product', 'discounts'])->latest()->get()
        );
    }

    /**
     * Store a newly created sales transaction in storage.
     */
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
            // A. Kurangi Stok Produk
            $product->decrement('stock', $validated['qty']);

            // B. Buat Record Penjualan
            $sale = new Sale();
            $sale->trx_code   = $trxCode;
            $sale->product_id = $product->id;
            $sale->qty        = $validated['qty'];
            $sale->created_at = $transDate;
            $sale->updated_at = $transDate;
            $sale->save();

            // C. Cek Diskon Otomatis yang Aktif pada Tanggal Transaksi
            $activeDiscount = Discount::where('product_id', $product->id)
                ->whereHas('salesDiscounts', function ($query) use ($transDate) {
                    $query->where('start_date', '<=', $transDate)
                          ->where('end_date', '>=', $transDate);
                })
                ->first();

            // D. Jika ada diskon aktif, catat relasi penjualan di t_sales_discount dengan sales_id = $sale->id
            if ($activeDiscount) {
                // Ambil rentang promo awal dari entri promo (sales_id IS NULL)
                $promoRange = SalesDiscount::where('discount_id', $activeDiscount->id)
                    ->whereNull('sales_id')
                    ->first();

                // Catat transaksi penggunaan diskon dengan sales_id terisi ID Transaksi Real
                SalesDiscount::create([
                    'sales_id'    => $sale->id,
                    'discount_id' => $activeDiscount->id,
                    'start_date'  => $promoRange ? $promoRange->start_date : $transDate,
                    'end_date'    => $promoRange ? $promoRange->end_date : $transDate,
                    'created_at'  => $transDate,
                    'updated_at'  => $transDate,
                ]);
            }
        });

        return response()->json([
            'message'  => 'Transaksi penjualan berhasil disimpan',
            'trx_code' => $trxCode,
        ], 201);
    }

    /**
     * Remove the specified sales transaction from storage.
     */
    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);

        DB::transaction(function () use ($sale) {
            // Kembalikan stok produk jika produk masih ada
            if ($sale->product) {
                $sale->product->increment('stock', $sale->qty);
            }
            
            // Hapus transaksi (jika relasi t_sales_discount memakai cascade/softDeletes, relasi ikut terproses)
            $sale->delete();
        });

        return response()->json([
            'message' => 'Transaksi penjualan berhasil dihapus & stok dikembalikan'
        ]);
    }
}