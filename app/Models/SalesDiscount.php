<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesDiscount extends Model
{
    protected $table = 't_sales_discount';

    protected $fillable = [
        'sales_id',
        'discount_id',
        'start_date',
        'end_date',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sales_id');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class, 'discount_id');
    }
}