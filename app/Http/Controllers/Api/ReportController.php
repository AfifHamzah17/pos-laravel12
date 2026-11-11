<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ProductCatalog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    private const METRICS = ['gross', 'discount', 'net', 'qty', 'transactions'];

    private const MAX_PRODUCT_SERIES = 8;

    /**
     * GET /api/reports/sales-trend
     *
     * Query:
     *  - start_date, end_date : rentang tanggal (default: dari penjualan pertama s/d terakhir)
     *  - product_ids[]        : filter produk (kosong = semua produk)
     *  - interval             : month (default) | day
     *  - group_by             : total (default) | brand | product
     *
     * Omset kotor = qty x harga produk saat ini; diskon = persentase diskon yang tercatat
     * pada t_sales_discount untuk penjualan tsb; omset bersih = kotor - diskon.
     */
    public function salesTrend(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'interval'   => 'nullable|in:day,month',
            'group_by'   => 'nullable|in:total,brand,product',
        ]);

        $productIds = collect(Arr::wrap($request->input('product_ids', [])))
            ->flatMap(fn ($value) => is_string($value) ? explode(',', $value) : [$value])
            ->map(fn ($value) => (int) $value)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $groupBy  = $request->input('group_by', 'total');
        $interval = $request->input('interval', 'month');

        // Batas data penjualan yang tersedia
        $bounds = DB::table('t_sales')
            ->whereNull('deleted_at')
            ->selectRaw('MIN(created_at) as min_at, MAX(created_at) as max_at')
            ->first();
        $minDate = $bounds && $bounds->min_at ? Carbon::parse($bounds->min_at)->startOfDay() : null;
        $maxDate = $bounds && $bounds->max_at ? Carbon::parse($bounds->max_at)->startOfDay() : null;

        $start = $request->filled('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : ($minDate ? $minDate->copy() : now()->startOfMonth());
        $end = $request->filled('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : ($maxDate ? $maxDate->copy()->endOfDay() : now()->endOfMonth());

        [$periods, $interval] = $this->buildPeriods($start, $end, $interval);
        $index = array_flip(array_column($periods, 'key'));
        $count = count($periods);

        $rows = DB::table('t_sales as s')
            ->join('m_products as p', 'p.id', '=', 's.product_id')
            ->leftJoin('t_sales_discount as sd', function ($join) {
                $join->on('sd.sales_id', '=', 's.id')->whereNull('sd.deleted_at');
            })
            ->leftJoin('t_discount as d', 'd.id', '=', 'sd.discount_id')
            ->whereNull('s.deleted_at')
            ->whereBetween('s.created_at', [$start, $end])
            ->when(! empty($productIds), fn ($query) => $query->whereIn('s.product_id', $productIds))
            ->get([
                's.product_id',
                's.qty',
                's.created_at',
                'p.name as product_name',
                'p.price',
                DB::raw('COALESCE(d.discount, 0) as discount'),
            ]);

        $totals    = $this->blank($count);
        $byProduct = [];
        $meta      = [];

        foreach ($rows as $row) {
            $key = $interval === 'day' ? substr($row->created_at, 0, 10) : substr($row->created_at, 0, 7);
            if (! isset($index[$key])) {
                continue;
            }
            $i = $index[$key];

            $qty      = (int) $row->qty;
            $gross    = $qty * (float) $row->price;
            $discount = $gross * (float) $row->discount;

            $pid = (int) $row->product_id;
            $byProduct[$pid] ??= $this->blank($count);
            $meta[$pid] ??= ['name' => $row->product_name, 'brand' => ProductCatalog::brandOf($row->product_name)];

            $this->add($totals, $i, $gross, $discount, $qty);
            $this->add($byProduct[$pid], $i, $gross, $discount, $qty);
        }

        $series = $this->buildSeries($groupBy, $productIds, $totals, $byProduct, $meta, $count);

        // Tabel ringkasan per produk (produk terpilih yang belum laku tetap tampil dengan nilai 0)
        foreach ($productIds as $pid) {
            if (! isset($byProduct[$pid])) {
                $product = Product::withTrashed()->find($pid);
                if ($product) {
                    $byProduct[$pid] = $this->blank($count);
                    $meta[$pid] = ['name' => $product->name, 'brand' => ProductCatalog::brandOf($product->name)];
                }
            }
        }
        $grandNet = array_sum($totals['net']);
        $products = [];
        foreach ($byProduct as $pid => $metrics) {
            $net = array_sum($metrics['net']);
            $products[] = [
                'id'           => $pid,
                'name'         => $meta[$pid]['name'],
                'brand'        => $meta[$pid]['brand'],
                'qty'          => (int) array_sum($metrics['qty']),
                'transactions' => (int) array_sum($metrics['transactions']),
                'gross'        => round(array_sum($metrics['gross']), 2),
                'discount'     => round(array_sum($metrics['discount']), 2),
                'net'          => round($net, 2),
                'share'        => $grandNet > 0 ? round($net / $grandNet * 100, 2) : 0,
            ];
        }
        usort($products, fn ($a, $b) => $b['net'] <=> $a['net']);

        return response()->json([
            'status'  => 'success',
            'filters' => [
                'start_date'  => $start->toDateString(),
                'end_date'    => $end->toDateString(),
                'interval'    => $interval,
                'group_by'    => $groupBy,
                'product_ids' => $productIds,
            ],
            'bounds'  => [
                'min' => $minDate?->toDateString(),
                'max' => $maxDate?->toDateString(),
            ],
            'periods' => $periods,
            'series'  => $series,
            'totals'  => $this->roundMetrics($totals),
            'summary' => $this->summary($totals, $periods),
            'products' => $products,
            'product_options' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->map(fn (Product $product) => [
                    'id'    => $product->id,
                    'name'  => $product->name,
                    'brand' => ProductCatalog::brandOf($product->name),
                    'price' => (float) $product->price,
                ])
                ->values(),
        ]);
    }

    /** @return array{0: array<int, array{key:string,label:string}>, 1: string} */
    private function buildPeriods(Carbon $start, Carbon $end, string $interval): array
    {
        // Rentang > 1 tahun per hari terlalu padat untuk chart: otomatis jadi bulanan
        if ($interval === 'day' && $start->diffInDays($end) > 366) {
            $interval = 'month';
        }

        $cursor  = $interval === 'day' ? $start->copy()->startOfDay() : $start->copy()->startOfMonth();
        $periods = [];

        while ($cursor->lte($end) && count($periods) < 1000) {
            $monthName = self::MONTHS[$cursor->month - 1];

            $periods[] = $interval === 'day'
                ? ['key' => $cursor->format('Y-m-d'), 'label' => $cursor->day . ' ' . $monthName]
                : ['key' => $cursor->format('Y-m'), 'label' => $monthName . ' ' . $cursor->year];

            $interval === 'day' ? $cursor->addDay() : $cursor->addMonth();
        }

        return [$periods, $interval];
    }

    private function blank(int $count): array
    {
        return array_fill_keys(self::METRICS, array_fill(0, max($count, 0), 0));
    }

    private function add(array &$acc, int $i, float $gross, float $discount, int $qty): void
    {
        $acc['gross'][$i]        += $gross;
        $acc['discount'][$i]     += $discount;
        $acc['net'][$i]          += $gross - $discount;
        $acc['qty'][$i]          += $qty;
        $acc['transactions'][$i] += 1;
    }

    private function merge(array &$target, array $source): void
    {
        foreach (self::METRICS as $metric) {
            foreach ($source[$metric] as $i => $value) {
                $target[$metric][$i] += $value;
            }
        }
    }

    private function roundMetrics(array $metrics): array
    {
        foreach (['gross', 'discount', 'net'] as $metric) {
            $metrics[$metric] = array_map(fn ($value) => round($value, 2), $metrics[$metric]);
        }

        return ['metrics' => $metrics];
    }

    private function buildSeries(string $groupBy, array $productIds, array $totals, array $byProduct, array $meta, int $count): array
    {
        $series = [];

        if ($groupBy === 'brand') {
            $brands = [];
            foreach ($byProduct as $pid => $metrics) {
                $brand = $meta[$pid]['brand'];
                $brands[$brand] ??= $this->blank($count);
                $this->merge($brands[$brand], $metrics);
            }
            foreach ($brands as $brand => $metrics) {
                $series[] = ['key' => 'brand:' . $brand, 'label' => $brand] + $this->roundMetrics($metrics);
            }
        } elseif ($groupBy === 'product') {
            uasort($byProduct, fn ($a, $b) => array_sum($b['net']) <=> array_sum($a['net']));

            $others = $this->blank($count);
            $hasOthers = false;
            $shown = 0;
            foreach ($byProduct as $pid => $metrics) {
                if ($shown < self::MAX_PRODUCT_SERIES) {
                    $series[] = ['key' => 'p:' . $pid, 'label' => $meta[$pid]['name']] + $this->roundMetrics($metrics);
                    $shown++;
                } else {
                    $this->merge($others, $metrics);
                    $hasOthers = true;
                }
            }
            if ($hasOthers) {
                $series[] = ['key' => 'others', 'label' => 'Produk lainnya'] + $this->roundMetrics($others);
            }

            return $series;
        } else {
            $series[] = [
                'key'   => 'total',
                'label' => empty($productIds) ? 'Semua produk' : count($productIds) . ' produk terpilih',
            ] + $this->roundMetrics($totals);

            return $series;
        }

        usort($series, fn ($a, $b) => array_sum($b['metrics']['net']) <=> array_sum($a['metrics']['net']));

        return $series;
    }

    private function summary(array $totals, array $periods): array
    {
        $gross    = array_sum($totals['gross']);
        $discount = array_sum($totals['discount']);
        $net      = array_sum($totals['net']);
        $tx       = (int) array_sum($totals['transactions']);
        $qty      = (int) array_sum($totals['qty']);

        $peak = null;
        if ($net > 0) {
            $peakIndex = array_search(max($totals['net']), $totals['net'], true);
            $peak = [
                'label' => $periods[$peakIndex]['label'] ?? null,
                'net'   => round($totals['net'][$peakIndex], 2),
            ];
        }

        return [
            'gross'            => round($gross, 2),
            'discount'         => round($discount, 2),
            'net'              => round($net, 2),
            'discount_percent' => $gross > 0 ? round($discount / $gross * 100, 2) : 0,
            'qty'              => $qty,
            'transactions'     => $tx,
            'avg_per_transaction' => $tx > 0 ? round($net / $tx, 2) : 0,
            'active_periods'   => count(array_filter($totals['transactions'])),
            'peak'             => $peak,
        ];
    }
}
