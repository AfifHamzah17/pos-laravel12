<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 't_discount';

    protected $fillable = [
        'product_id',
        'discount',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // Relasi ke tabel pivot t_sales_discount
    public function salesDiscounts()
    {
        return $this->hasMany(SalesDiscount::class, 'discount_id');
    }
}