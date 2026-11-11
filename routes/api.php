<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;

// 1. Auth Public Routes (Daftarkan Paling Atas)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 2. Dashboard Route
Route::get('/dashboard', [DashboardController::class, 'index']);

// Laporan tren penjualan (chart + tabel, filter tanggal & produk)
Route::get('/reports/sales-trend', [ReportController::class, 'salesTrend']);

// 3. Resource & Management Routes
Route::apiResource('products', ProductController::class);
Route::apiResource('stocks', StockController::class);
Route::apiResource('sales', SaleController::class);

Route::get('discounts', [DiscountController::class, 'index']);
Route::post('discounts', [DiscountController::class, 'store']);
Route::get('discounts-used', [DiscountController::class, 'usedDiscounts']);

Route::put('discounts/{id}', [DiscountController::class, 'update']);
Route::delete('discounts/{id}', [DiscountController::class, 'destroy']);
Route::delete('stocks/{id}', [StockController::class, 'destroy']);
