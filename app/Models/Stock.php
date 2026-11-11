<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory, SoftDeletes;

    // Pastikan pakai 't_stocks' jika migrasinya t_stocks
    protected $table = 't_stocks';

    protected $fillable = [
        'product_id',
        'qty',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}