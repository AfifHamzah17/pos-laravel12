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
        // 1. Tangkap parameter filter tanggal (Default: 30 hari terakhir s/d Hari ini)
        $startDate = $request->query('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate   = $request->query('end_date', Carbon::now()->toDateString());

        // 2. Query Grafik Omset: Grouping berdasarkan Tanggal Transaksi (DATE(t_sales.created_at))
        $chartData = Sale::join('m_products', 't_sales.product_id', '=', 'm_products.id')
            ->select(
                DB::raw('DATE(t_sales.created_at) as date'),
                DB::raw('SUM(t_sales.qty * m_products.price) as total_omset'),
                DB::raw('COUNT(t_sales.id) as sales_count')
            )
            ->whereDate('t_sales.created_at', '>=', $startDate)
            ->whereDate('t_sales.created_at', '<=', $endDate)
            ->whereNull('t_sales.deleted_at')
            ->groupBy(DB::raw('DATE(t_sales.created_at)'))
            ->orderBy('date', 'ASC')
            ->get();

        // 3. Total Omset Keseluruhan dalam Periode Terpilih
        $totalOmset = $chartData->sum('total_omset');

        // 4. Query 5 Transaksi Penjualan Terakhir (Menggunakan Kode Trx Unique)
        $lastSales = Sale::with('product')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($sale) {
                return [
                    'id'      => $sale->trx_code ?? ('TRX-' . str_pad($sale->id, 4, '0', STR_PAD_LEFT)),
                    'product' => $sale->product ? $sale->product->name : 'Produk Dihapus',
                    'qty'     => $sale->qty,
                    'total'   => $sale->qty * ($sale->product ? $sale->product->price : 0),
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