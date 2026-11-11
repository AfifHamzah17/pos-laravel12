<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_sales_discount', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->nullable()->constrained('t_sales')->onDelete('cascade');
            $table->foreignId('discount_id')->constrained('t_discount')->onDelete('cascade');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_sales_discount');
    }
};