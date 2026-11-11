<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 't_sales';

    protected $fillable = [
        'product_id',
        'qty',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function salesDiscounts()
    {
        return $this->hasMany(SalesDiscount::class, 'sales_id');
    }

    public function discounts()
    {
        return $this->belongsToMany(Discount::class, 't_sales_discount', 'sales_id', 'discount_id')
                    ->withPivot('start_date', 'end_date')
                    ->withTimestamps();
    }
}