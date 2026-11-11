<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Stock;
use App\Support\ProductCatalog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Default: produk acak dari katalog sparepart (aki GS, busi Denso,
     * wiper Aspira, shock Kayaba, oli Evalube) dengan stok 100-555.
     */
    public function definition(): array
    {
        return $this->attributesFromItem(fake()->randomElement(ProductCatalog::items()));
    }

    /** Buat produk dari satu item katalog tertentu. */
    public function fromCatalog(array $item): static
    {
        return $this->state(fn () => $this->attributesFromItem($item));
    }

    /** Catat stok awal ke riwayat pengadaan (t_stocks) agar konsisten dengan stok produk. */
    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            if ((int) $product->stock > 0) {
                Stock::create([
                    'product_id' => $product->id,
                    'qty'        => (int) $product->stock,
                ]);
            }
        });
    }

    private function attributesFromItem(array $item): array
    {
        return [
            'name'        => $item['name'],
            'description' => $item['description'],
            'price'       => $item['price'],
            'stock'       => fake()->numberBetween(100, 555),
        ];
    }
}
