<?php

namespace App\Console\Commands;

use App\Models\Discount;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SalesDiscount;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class GenerateDummySales extends Command
{
    protected $signature = 'sales:generate-dummy
                            {--count=120 : Jumlah penjualan (minimal 100)}
                            {--from=2026-01 : Bulan awal (YYYY-MM)}
                            {--to=2026-05 : Bulan akhir (YYYY-MM)}
                            {--discounts-per-month=15 : Jumlah promo diskon acak per bulan}
                            {--fresh : Hapus semua penjualan & diskon lama, stok produk dikembalikan}
                            {--force : Lewati konfirmasi untuk --fresh}';

    protected $description = 'Buat penjualan dummy (min. 100) Jan-Mei 2026 dengan diskon acak per bulan';

    public function handle(): int
    {
        $count = (int) $this->option('count');
        if ($count < 100) {
            $this->warn('Jumlah penjualan minimal 100, memakai 100.');
            $count = 100;
        }

        try {
            $from = Carbon::createFromFormat('!Y-m', (string) $this->option('from'))->startOfMonth();
            $to   = Carbon::createFromFormat('!Y-m', (string) $this->option('to'))->startOfMonth();
        } catch (\Throwable $e) {
            $this->error('Format --from/--to harus YYYY-MM, contoh: 2026-01');

            return self::FAILURE;
        }

        if ($from->gt($to)) {
            $this->error('--from tidak boleh lebih besar dari --to.');

            return self::FAILURE;
        }

        if (Product::query()->count() === 0) {
            $this->error('Belum ada produk. Jalankan dulu: php artisan products:generate-dummy');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            if (! $this->option('force') && ! $this->confirm('Semua penjualan dan diskon lama akan dihapus permanen. Lanjutkan?')) {
                $this->warn('Dibatalkan.');

                return self::FAILURE;
            }
            $this->resetSalesData();
        }

        $products = Product::query()->where('stock', '>', 0)->get(['id', 'stock']);
        if ($products->isEmpty()) {
            $this->error('Semua produk berstok 0. Tambahkan stok dulu.');

            return self::FAILURE;
        }
        $stock = $products->pluck('stock', 'id')->map(fn ($qty) => (int) $qty)->all();

        // Bulan-bulan yang dicakup + pembagian jumlah penjualan (acak per bulan agar tren bervariasi)
        $months = [];
        for ($cursor = $from->copy(); $cursor->lte($to); $cursor->addMonth()) {
            $months[] = $cursor->copy();
        }
        $alloc = $this->allocate($count, count($months));
        $promosPerMonth = max(0, (int) $this->option('discounts-per-month'));

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $summary = [];
        $shortage = false;

        DB::transaction(function () use ($months, $alloc, $promosPerMonth, &$stock, $bar, &$summary, &$shortage) {
            foreach ($months as $i => $monthStart) {
                $promos = $this->createMonthlyPromos($monthStart, array_keys($stock), $promosPerMonth);
                $made = 0;

                for ($n = 0; $n < $alloc[$i]; $n++) {
                    $date = $monthStart->copy()
                        ->day(random_int(1, $monthStart->daysInMonth))
                        ->setTime(random_int(8, 20), random_int(0, 59), random_int(0, 59));
                    if ($date->isFuture()) {
                        $date = now()->subMinutes(random_int(1, 600));
                    }

                    $qty = Arr::random([1, 1, 1, 2, 2, 3, 4, 5, 6, 8, 10]);
                    $eligible = array_keys(array_filter($stock, fn ($left) => $left >= $qty));
                    if (empty($eligible)) {
                        $shortage = true;
                        break;
                    }

                    // 40% penjualan diarahkan ke produk yang sedang promo supaya diskon terlihat di laporan
                    $productId = null;
                    $active = array_values(array_filter($promos, fn ($p) => $date->between($p['start'], $p['end'])));
                    if ($active && random_int(1, 100) <= 40) {
                        $candidate = $active[array_rand($active)]['product_id'];
                        if (in_array($candidate, $eligible, true)) {
                            $productId = $candidate;
                        }
                    }
                    $productId ??= $eligible[array_rand($eligible)];

                    Sale::factory()->onDate($date)->forProduct($productId, $qty)->create();
                    $stock[$productId] -= $qty;
                    $made++;
                    $bar->advance();
                }

                $summary[] = [$monthStart->format('Y-m'), count($promos), $made];
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->table(['Bulan', 'Promo diskon', 'Penjualan'], $summary);

        $total = array_sum(array_column($summary, 2));
        $discounted = SalesDiscount::query()->whereNotNull('sales_id')->count();
        $this->info("Selesai: {$total} penjualan dibuat, {$discounted} di antaranya memakai diskon.");
        if ($shortage) {
            $this->warn('Sebagian penjualan dilewati karena stok produk tidak cukup.');
        }

        return self::SUCCESS;
    }

    /** Bagi $total penjualan ke $buckets bulan dengan bobot acak 70-130%. */
    private function allocate(int $total, int $buckets): array
    {
        $weights = array_map(fn () => random_int(70, 130), range(1, $buckets));
        $sum = array_sum($weights);
        $alloc = array_map(fn ($w) => (int) floor($total * $w / $sum), $weights);

        for ($i = 0; array_sum($alloc) < $total; $i = ($i + 1) % $buckets) {
            $alloc[$i]++;
        }

        return $alloc;
    }

    /** Buat promo diskon acak untuk satu bulan; masa berlaku 7-18 hari di dalam bulan tsb. */
    private function createMonthlyPromos(Carbon $monthStart, array $productIds, int $howMany): array
    {
        if ($howMany === 0 || empty($productIds)) {
            return [];
        }

        $monthEnd = $monthStart->copy()->endOfMonth();
        shuffle($productIds);
        $promos = [];

        foreach (array_slice($productIds, 0, $howMany) as $productId) {
            $start = $monthStart->copy()
                ->day(random_int(1, max(1, $monthStart->daysInMonth - 6)))
                ->startOfDay();
            $end = $start->copy()->addDays(random_int(7, 18))->endOfDay();
            if ($end->gt($monthEnd)) {
                $end = $monthEnd->copy();
            }

            Discount::factory()
                ->state(['product_id' => $productId])
                ->activeBetween($start, $end)
                ->create();

            $promos[] = ['product_id' => $productId, 'start' => $start, 'end' => $end];
        }

        return $promos;
    }

    private function resetSalesData(): void
    {
        DB::transaction(function () {
            SalesDiscount::query()->delete();
            Sale::withTrashed()->forceDelete();
            Discount::withTrashed()->forceDelete();

            // stok produk = total riwayat pengadaan (karena semua penjualan dihapus)
            Product::query()->get()->each(function (Product $product) {
                $product->update(['stock' => (int) $product->stocks()->sum('qty')]);
            });
        });

        $this->info('Penjualan & diskon lama dihapus, stok produk dikembalikan.');
    }
}
