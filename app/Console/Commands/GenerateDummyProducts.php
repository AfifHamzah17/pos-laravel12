<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Stock;
use App\Support\ProductCatalog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateDummyProducts extends Command
{
    protected $signature = 'products:generate-dummy
                            {--fresh : Hapus SEMUA produk (beserta stok, penjualan & diskon terkait) sebelum membuat data baru}
                            {--force : Lewati konfirmasi untuk --fresh}';

    protected $description = 'Buat produk sparepart dummy: aki GS, busi Denso, wiper Aspira, shock Kayaba, oli Evalube (stok acak 100-555)';

    public function handle(): int
    {
        if ($this->option('fresh')) {
            if (! $this->option('force') && ! $this->confirm('Semua produk, stok, penjualan dan diskon akan dihapus permanen. Lanjutkan?')) {
                $this->warn('Dibatalkan.');

                return self::FAILURE;
            }

            DB::transaction(function () {
                Product::withTrashed()->forceDelete();
            });
            $this->info('Data produk lama dihapus.');
        }

        $created = 0;
        $skipped = 0;

        DB::transaction(function () use (&$created, &$skipped) {
            foreach (ProductCatalog::items() as $item) {
                if (Product::withTrashed()->where('name', $item['name'])->exists()) {
                    $skipped++;

                    continue;
                }

                Product::factory()->fromCatalog($item)->create();
                $created++;
            }
        });

        $rows = Product::query()->get()
            ->groupBy(fn (Product $product) => ProductCatalog::brandOf($product->name))
            ->map(fn ($products, $brand) => [
                $brand,
                $products->count(),
                $products->min('stock'),
                $products->max('stock'),
                number_format($products->sum('stock'), 0, ',', '.'),
            ])
            ->values()
            ->all();

        $this->table(['Brand', 'Jumlah produk', 'Stok min', 'Stok maks', 'Total stok'], $rows);
        $this->info("Selesai: {$created} produk dibuat, {$skipped} dilewati (nama sudah ada).");

        return self::SUCCESS;
    }
}
