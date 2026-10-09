<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'E-Invoice Travel Agency API (Laravel + Neon PostgreSQL)',
        'version' => '1.0.0',
        'endpoints' => [
            'GET  /api/invoices' => 'List all invoices (supports ?status=, ?search=, ?per_page=-1)',
            'POST /api/invoices' => 'Create or save invoice draft',
            'GET  /api/invoices/{id}' => 'View single invoice details',
            'PATCH /api/invoices/{id}/status' => 'Update status (paid, partial, unpaid)',
            'DELETE /api/invoices/{id}' => 'Soft delete invoice',
            'POST /api/invoices/bulk' => 'Batch bulk import invoices',
            'GET  /api/analytics' => 'Aggregated financial BI statistics',
            'GET  /api/test-db' => 'Check Neon Database connection status'
        ]
    ]);
});
