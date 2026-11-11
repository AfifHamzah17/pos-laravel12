<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_sales', function (Blueprint $table) {
            $table->id();
            $table->string('trx_code')->nullable()->unique(); // <-- TAMBAHKAN BARIS INI
            $table->foreignId('product_id')->constrained('m_products')->onDelete('cascade');
            $table->integer('qty');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_sales');
    }
};