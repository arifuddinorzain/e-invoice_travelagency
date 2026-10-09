<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InvoiceController;

/*
|--------------------------------------------------------------------------
| API Routes for E-Invoice Travel System (Laravel + Neon)
|--------------------------------------------------------------------------
*/

// Neon Database Health & Info
Route::get('/test-db', [InvoiceController::class, 'testConnection']);

// Fast Real-Time Analytics from Neon DB
Route::get('/analytics', [InvoiceController::class, 'analytics']);

// Bulk Import from PDF/JSON batch parser
Route::post('/invoices/bulk', [InvoiceController::class, 'bulkImport']);

// Update Invoice Status
Route::patch('/invoices/{id}/status', [InvoiceController::class, 'updateStatus']);

// Invoice CRUD Operations
Route::apiResource('invoices', InvoiceController::class);

