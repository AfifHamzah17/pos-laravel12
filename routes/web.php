<?php

use Illuminate\Support\Facades\Route;

// Catch all route ke view welcome (React App)
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');