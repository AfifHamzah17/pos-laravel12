<?php

namespace Database\Factories;

use App\Models\Discount;
use App\Models\Product;
use App\Models\SalesDiscount;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Discount>
 */
class DiscountFactory extends Factory
{
    protected $model = Discount::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::query()->inRandomOrder()->value('id') ?? Product::factory(),
            // disimpan sebagai desimal (0.10 = 10%), sama seperti DiscountController
            'discount'   => fake()->randomElement([0.05, 0.10, 0.15, 0.20, 0.25, 0.30]),
        ];
    }

    /** Periode berlaku promo (baris t_sales_discount dengan sales_id NULL). */
    public function activeBetween(DateTimeInterface $start, DateTimeInterface $end): static
    {
        return $this->afterCreating(function (Discount $discount) use ($start, $end) {
            SalesDiscount::create([
                'sales_id'    => null,
                'discount_id' => $discount->id,
                'start_date'  => $start,
                'end_date'    => $end,
            ]);
        });
    }
}
