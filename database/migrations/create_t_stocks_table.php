<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('m_products')->onDelete('cascade');
            $table->integer('qty');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_stocks');
    }
};