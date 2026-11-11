<?php

namespace Database\Factories;

use App\Models\Discount;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SalesDiscount;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $date = fake()->dateTimeBetween('2026-01-01 08:00:00', '2026-05-31 20:00:00');

        return [
            'product_id' => Product::query()->inRandomOrder()->value('id') ?? Product::factory(),
            'qty'        => fake()->numberBetween(1, 6),
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }

    public function onDate(DateTimeInterface $date): static
    {
        return $this->state(fn () => [
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    public function forProduct(int|Product $product, ?int $qty = null): static
    {
        $id = $product instanceof Product ? $product->id : $product;

        return $this->state(fn () => array_filter([
            'product_id' => $id,
            'qty'        => $qty,
        ], fn ($value) => $value !== null));
    }

    /**
     * Meniru alur SaleController@store: kode transaksi unik, diskon otomatis
     * jika promo aktif pada tanggal transaksi, dan stok produk berkurang.
     */
    public function configure(): static
    {
        return $this
            ->afterMaking(function (Sale $sale) {
                if (empty($sale->trx_code)) {
                    $date = $sale->created_at ?? now();
                    $sale->trx_code = sprintf(
                        'TRX-%s-PRD%d-%s',
                        $date->format('Ymd'),
                        $sale->product_id,
                        strtoupper(Str::random(5))
                    );
                }
            })
            ->afterCreating(function (Sale $sale) {
                $date = $sale->created_at;

                $activeDiscount = Discount::query()
                    ->where('product_id', $sale->product_id)
                    ->whereHas('salesDiscounts', function ($query) use ($date) {
                        $query->whereNull('sales_id')
                            ->where('start_date', '<=', $date)
                            ->where('end_date', '>=', $date);
                    })
                    ->first();

                if ($activeDiscount) {
                    $promo = SalesDiscount::query()
                        ->where('discount_id', $activeDiscount->id)
                        ->whereNull('sales_id')
                        ->first();

                    $usage = new SalesDiscount([
                        'sales_id'    => $sale->id,
                        'discount_id' => $activeDiscount->id,
                        'start_date'  => $promo?->start_date ?? $date,
                        'end_date'    => $promo?->end_date ?? $date,
                    ]);
                    $usage->created_at = $date;
                    $usage->updated_at = $date;
                    $usage->save();
                }

                Product::query()->whereKey($sale->product_id)->decrement('stock', $sale->qty);
            });
    }
}
