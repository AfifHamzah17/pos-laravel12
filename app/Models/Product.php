<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'm_products';

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
    ];

    /**
     * Relasi ke Stock (One to Many)
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'product_id');
    }

    /**
     * Relasi ke Sales (One to Many)
     */
    public function sales()
    {
        return $this->hasMany(Sale::class, 'product_id');
    }

    /**
     * Relasi ke Discount (One to Many)
     */
    public function discounts()
    {
        return $this->hasMany(Discount::class, 'product_id');
    }
}