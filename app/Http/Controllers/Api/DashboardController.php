<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter filter tanggal (Default: Awal Bulan s/d Akhir Bulan)
        $defaultStart = Carbon::now()->startOfMonth()->toDateString();
        $defaultEnd   = Carbon::now()->endOfMonth()->toDateString();

        $startDate = $request->query('start_date', $defaultStart);
        $endDate   = $request->query('end_date', $defaultEnd);

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        // 2. Query Grafik Omset: Hitung omset dari (qty * price)
        $chartData = Sale::join('m_products', 't_sales.product_id', '=', 'm_products.id')
            ->select(
                DB::raw('DATE(t_sales.created_at) as date'),
                DB::raw('SUM(t_sales.qty * m_products.price) as total_omset'),
                DB::raw('COUNT(t_sales.id) as sales_count')
            )
            ->whereBetween('t_sales.created_at', [$start, $end])
            ->whereNull('t_sales.deleted_at')
            ->groupBy(DB::raw('DATE(t_sales.created_at)'))
            ->orderBy('date', 'ASC')
            ->get();

        // 3. Total Omset Keseluruhan Periode
        $totalOmset = (float) $chartData->sum('total_omset');

        // 4. Query 5 Transaksi Penjualan Terakhir (Filtered Date)
        $lastSales = Sale::with('product')
            ->whereBetween('created_at', [$start, $end])
            ->latest('created_at')
            ->take(5)
            ->get()
            ->map(function ($sale) {
                $price = $sale->product ? (float) $sale->product->price : 0;
                $totalPrice = isset($sale->total) ? (float) $sale->total : ($sale->qty * $price);

                return [
                    'id'      => $sale->trx_code ?? ('TRX-' . str_pad($sale->id, 4, '0', STR_PAD_LEFT)),
                    'product' => $sale->product ? $sale->product->name : 'Produk Dihapus',
                    'qty'     => (int) $sale->qty,
                    'total'   => $totalPrice,
                    'time'    => $sale->created_at ? $sale->created_at->format('d M Y H:i') : '-',
                ];
            });

        return response()->json([
            'status'       => 'success',
            'start_date'   => $startDate,
            'end_date'     => $endDate,
            'total_omset'  => $totalOmset,
            'chart_data'   => $chartData,
            'last_5_sales' => $lastSales,
        ]);
    }
}