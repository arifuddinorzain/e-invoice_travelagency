<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    /**
     * Test Database Connection (Neon PostgreSQL or fallback)
     */
    public function testConnection()
    {
        try {
            $start = microtime(true);
            $dbName = DB::connection()->getDatabaseName();
            $driver = DB::connection()->getDriverName();
            $version = DB::select("SELECT version()")[0]->version ?? 'Unknown';
            $latency = round((microtime(true) - $start) * 1000, 2);

            $totalInvoices = Invoice::count();

            return response()->json([
                'status' => 'connected',
                'driver' => $driver,
                'database' => $dbName,
                'server_version' => $version,
                'latency_ms' => $latency,
                'total_saved_invoices' => $totalInvoices,
                'message' => 'Successfully connected to database (Neon PostgreSQL).'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'pending_configuration',
                'driver' => config('database.default'),
                'message' => 'Database not connected yet. Please provide your Neon PostgreSQL connection string in backend/.env.',
                'error_detail' => $e->getMessage()
            ], 200);
        }
    }

    /**
     * Display a listing of invoices with filters.
     */
    public function index(Request $request)
    {
        $query = Invoice::query()->with('items');

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'ilike', "%{$search}%")
                  ->orWhere('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('trip_name', 'ilike', "%{$search}%")
                  ->orWhere('trip_consultant', 'ilike', "%{$search}%");
            });
        }

        // Company Filter
        if ($company = $request->input('company')) {
            $query->where('company_name', $company);
        }

        // Consultant Filter
        if ($consultant = $request->input('consultant')) {
            $query->where('trip_consultant', $consultant);
        }

        // Trip Filter
        if ($trip = $request->input('trip')) {
            $query->where('trip_name', $trip);
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Date Range Filter
        $dateRange = $request->input('date_range', 'all');
        $now = Carbon::now();

        if ($dateRange === '30days') {
            $query->where('invoice_date', '>=', $now->subDays(30)->toDateString());
        } elseif ($dateRange === '90days') {
            $query->where('invoice_date', '>=', $now->subDays(90)->toDateString());
        } elseif ($dateRange === 'thisMonth') {
            $query->where('invoice_date', '>=', $now->startOfMonth()->toDateString());
        } elseif ($dateRange === 'thisYear') {
            $query->where('invoice_date', '>=', $now->startOfYear()->toDateString());
        } elseif ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('invoice_date', [$request->start_date, $request->end_date]);
        }

        // Sorting
        $sortColumn = $request->input('sort_by', 'invoice_date');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['invoice_no', 'invoice_date', 'due_date', 'customer_name', 'subtotal', 'deposit_paid', 'balance_due', 'status'];

        if (in_array($sortColumn, $allowedSorts)) {
            $query->orderBy($sortColumn, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('invoice_date', 'desc');
        }

        $perPage = (int) $request->input('per_page', 20);
        if ($perPage === -1) {
            $invoices = $query->get();
            return response()->json(['data' => $invoices, 'total' => $invoices->count()]);
        }

        return response()->json($query->paginate($perPage));
    }

    private function cleanDate($dateStr, $default = null)
    {
        if (empty($dateStr)) return $default ?: date('Y-m-d');
        $d = trim((string) $dateStr);
        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $d, $m)) {
            return substr($d, 0, 10);
        }
        try {
            return Carbon::parse($d)->toDateString();
        } catch (\Throwable $e) {
            return $default ?: date('Y-m-d');
        }
    }

    /**
     * Store or update an invoice.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        $invoiceNo = trim($data['invoiceNo'] ?? $data['invoice_no'] ?? '');
        if (empty($invoiceNo)) {
            $invoiceNo = 'INV-' . date('Ymd') . '-' . rand(100, 999);
        }

        $currency = $data['currency'] ?? 'RM';
        $exchangeRate = (float) ($data['exchangeRate'] ?? $data['exchange_rate'] ?? 1.0);
        $invoiceDate = $this->cleanDate($data['invoiceDate'] ?? $data['invoice_date'] ?? null, date('Y-m-d'));
        $dueDate = $this->cleanDate($data['dueDate'] ?? $data['due_date'] ?? null, date('Y-m-d', strtotime('+14 days')));

        // Calculate line items
        $items = $data['items'] ?? [];
        $addons = $data['addons'] ?? [];

        $subtotal = 0;
        $totalPax = 0;

        foreach ($items as $item) {
            $p = (float) str_replace(',', '', $item['price'] ?? 0);
            $q = (int) ($item['qty'] ?? $item['quantity'] ?? 1);
            $subtotal += ($p * $q);
            $totalPax += $q;
        }

        foreach ($addons as $addon) {
            $p = (float) str_replace(',', '', $addon['price'] ?? 0);
            $q = (int) ($addon['qty'] ?? $addon['quantity'] ?? 1);
            $subtotal += ($p * $q);
        }

        if (isset($data['grandTotal']) && (float)$data['grandTotal'] > 0) {
            $subtotal = (float)$data['grandTotal'];
        } elseif (isset($data['subtotal']) && (float)$data['subtotal'] > 0 && $subtotal == 0) {
            $subtotal = (float)$data['subtotal'];
        }

        $depositPaid = (float) str_replace(',', '', $data['depositPaid'] ?? $data['deposit_paid'] ?? 0);
        $balanceDue = max(0, $subtotal - $depositPaid);

        // Determine Payment Status
        $today = date('Y-m-d');
        if (isset($data['status']) && in_array(strtolower($data['status']), ['paid', 'partial', 'unpaid', 'overdue'])) {
            $status = strtolower($data['status']);
        } elseif ($depositPaid >= $subtotal && $subtotal > 0) {
            $status = 'paid';
        } elseif ($depositPaid > 0) {
            $status = 'partial';
        } elseif ($dueDate < $today) {
            $status = 'overdue';
        } else {
            $status = 'unpaid';
        }

        if (!$totalPax && isset($data['tripPax'])) {
            $totalPax = (int) $data['tripPax'];
        }
        if (!$totalPax) $totalPax = 1;

        DB::beginTransaction();
        try {
            $invoice = Invoice::updateOrCreate(
                ['invoice_no' => $invoiceNo],
                [
                    'invoice_date' => $invoiceDate,
                    'due_date' => $dueDate,
                    'company_name' => $data['companyName'] ?? $data['company_name'] ?? 'SELAMATVN TOUR AND TRAVEL',
                    'company_address' => $data['companyAddress'] ?? $data['company_address'] ?? null,
                    'company_phone' => $data['companyPhone'] ?? $data['company_phone'] ?? null,
                    'company_email' => $data['companyEmail'] ?? $data['company_email'] ?? null,
                    'company_license' => $data['companyLicense'] ?? $data['company_license'] ?? null,
                    'company_website' => $data['companyWebsite'] ?? $data['company_website'] ?? null,
                    'customer_name' => $data['customerName'] ?? $data['customer_name'] ?? 'Customer',
                    'customer_address' => $data['customerAddress'] ?? $data['customer_address'] ?? null,
                    'customer_social' => $data['customerSocial'] ?? $data['customer_social'] ?? null,
                    'trip_name' => $data['tripName'] ?? $data['trip_name'] ?? 'Vietnam Tour',
                    'trip_date' => $data['tripDate'] ?? $data['trip_date'] ?? null,
                    'trip_consultant' => $data['tripConsultant'] ?? $data['trip_consultant'] ?? 'General Sales',
                    'trip_pax' => $totalPax,
                    'group_size' => $data['groupSize'] ?? $data['group_size'] ?? null,
                    'payment_terms' => $data['paymentTerms'] ?? $data['payment_terms'] ?? 'FULL PAYMENT',
                    'payment_mode' => $data['paymentMode'] ?? $data['payment_mode'] ?? 'ONLINE BANKING',
                    'currency' => $currency,
                    'exchange_rate' => $exchangeRate,
                    'subtotal' => $subtotal,
                    'deposit_paid' => $depositPaid,
                    'balance_due' => $balanceDue,
                    'tax_percent' => (float) ($data['tax'] ?? $data['tax_percent'] ?? 0),
                    'tax_enabled' => (bool) ($data['enableTax'] ?? $data['tax_enabled'] ?? false),
                    'status' => $status,
                    'approved_by' => $data['approvedByName'] ?? $data['approved_by'] ?? null,
                    'package_includes' => $data['packageIncludes'] ?? $data['package_includes'] ?? null,
                    'items_data' => $items,
                    'addons_data' => $addons,
                    'raw_draft' => $data
                ]
            );

            // Sync item rows
            $invoice->items()->delete();

            foreach ($items as $item) {
                $p = (float) str_replace(',', '', $item['price'] ?? 0);
                $q = (int) ($item['qty'] ?? $item['quantity'] ?? 1);
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'type' => 'package',
                    'description' => $item['desc'] ?? $item['description'] ?? 'Package Item',
                    'vi_description' => $item['viDesc'] ?? $item['vi_description'] ?? null,
                    'quantity' => $q,
                    'unit_price' => $p,
                    'total_amount' => $p * $q,
                ]);
            }

            foreach ($addons as $addon) {
                $p = (float) str_replace(',', '', $addon['price'] ?? 0);
                $q = (int) ($addon['qty'] ?? $addon['quantity'] ?? 1);
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'type' => 'addon',
                    'description' => $addon['desc'] ?? $addon['description'] ?? 'Add-on Service',
                    'vi_description' => $addon['viDesc'] ?? $addon['vi_description'] ?? null,
                    'quantity' => $q,
                    'unit_price' => $p,
                    'total_amount' => $p * $q,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoice saved to Neon database successfully!',
                'data' => $invoice->load('items')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving invoice: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single invoice.
     */
    public function show($id)
    {
        $invoice = is_numeric($id) 
            ? Invoice::with('items')->find($id) 
            : Invoice::with('items')->where('invoice_no', $id)->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return response()->json($invoice);
    }

    /**
     * Update only the payment status of an invoice.
     */
    public function updateStatus(Request $request, $id)
    {
        $invoice = is_numeric($id) 
            ? Invoice::find($id) 
            : Invoice::where('invoice_no', $id)->first();

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found in database'
            ], 404);
        }

        $rawJson = json_decode($request->getContent(), true) ?: [];
        $rawStatus = $request->input('status') ?? $request->json('status') ?? $rawJson['status'] ?? 'unpaid';
        $newStatus = strtolower(trim((string) $rawStatus));
        $validStatuses = ['paid', 'partial', 'unpaid'];
        if (!in_array($newStatus, $validStatuses)) {
            $newStatus = 'unpaid';
        }

        $invoice->status = $newStatus;
        if ($invoice->raw_draft) {
            $raw = is_array($invoice->raw_draft) ? $invoice->raw_draft : json_decode($invoice->raw_draft, true);
            if ($raw) {
                $raw['status'] = $newStatus;
                $invoice->raw_draft = $raw;
            }
        }
        $invoice->save();

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoice->invoice_no} status updated to " . ucfirst($newStatus),
            'status' => $newStatus,
            'invoice' => $invoice
        ]);
    }

    /**
     * Soft delete an invoice.
     */
    public function destroy($id)
    {
        $invoice = is_numeric($id) 
            ? Invoice::find($id) 
            : Invoice::where('invoice_no', $id)->first();

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found in database'
            ], 404);
        }

        $invoiceNo = $invoice->invoice_no;
        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoiceNo} soft deleted successfully!"
        ]);
    }

    /**
     * Bulk Import Multiple Invoices into Neon DB.
     */
    public function bulkImport(Request $request)
    {
        $invoices = $request->input('invoices', []);
        if (empty($invoices)) {
            return response()->json(['message' => 'No invoices provided'], 400);
        }

        $savedCount = 0;
        $errors = [];

        foreach ($invoices as $invData) {
            try {
                $req = new Request($invData);
                $this->store($req);
                $savedCount++;
            } catch (\Exception $e) {
                $errors[] = $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'imported_count' => $savedCount,
            'errors' => $errors,
            'message' => "Successfully imported {$savedCount} invoices into Neon DB!"
        ]);
    }

    /**
     * Fast Real-time Analytics Query directly from Neon DB.
     */
    public function analytics(Request $request)
    {
        $query = Invoice::query();

        if ($company = $request->input('company')) $query->where('company_name', $company);
        if ($consultant = $request->input('consultant')) $query->where('trip_consultant', $consultant);
        if ($trip = $request->input('trip')) $query->where('trip_name', $trip);
        if ($status = $request->input('status')) $query->where('status', $status);

        $dateRange = $request->input('date_range', 'all');
        $now = Carbon::now();
        if ($dateRange === '30days') $query->where('invoice_date', '>=', $now->subDays(30)->toDateString());
        elseif ($dateRange === '90days') $query->where('invoice_date', '>=', $now->subDays(90)->toDateString());
        elseif ($dateRange === 'thisMonth') $query->where('invoice_date', '>=', $now->startOfMonth()->toDateString());
        elseif ($dateRange === 'thisYear') $query->where('invoice_date', '>=', $now->startOfYear()->toDateString());

        $invoices = $query->get();

        $totalRevenue = 0;
        $totalDeposit = 0;
        $totalBalance = 0;
        $totalPax = 0;

        $monthlyTrend = [];
        $topTrips = [];
        $consultants = [];
        $topClients = [];
        $paymentStatus = ['paid' => 0, 'partial' => 0, 'unpaid' => 0, 'overdue' => 0];

        foreach ($invoices as $inv) {
            $rate = ($inv->exchange_rate && $inv->exchange_rate != 1) ? $inv->exchange_rate : 1.0;
            $rev = $inv->currency === 'RM' ? $inv->subtotal : ($inv->subtotal / $rate);
            $dep = $inv->currency === 'RM' ? $inv->deposit_paid : ($inv->deposit_paid / $rate);
            $bal = $inv->currency === 'RM' ? $inv->balance_due : ($inv->balance_due / $rate);

            $totalRevenue += $rev;
            $totalDeposit += $dep;
            $totalBalance += $bal;
            $totalPax += $inv->trip_pax;

            // Monthly Trend
            $mKey = $inv->invoice_date ? $inv->invoice_date->format('Y-m') : 'Unknown';
            if (!isset($monthlyTrend[$mKey])) {
                $monthlyTrend[$mKey] = ['revenue' => 0, 'deposit' => 0, 'count' => 0];
            }
            $monthlyTrend[$mKey]['revenue'] += $rev;
            $monthlyTrend[$mKey]['deposit'] += $dep;
            $monthlyTrend[$mKey]['count'] += 1;

            // Top Trips
            $tName = $inv->trip_name ?: 'Other';
            if (!isset($topTrips[$tName])) $topTrips[$tName] = ['revenue' => 0, 'pax' => 0, 'count' => 0];
            $topTrips[$tName]['revenue'] += $rev;
            $topTrips[$tName]['pax'] += $inv->trip_pax;
            $topTrips[$tName]['count'] += 1;

            // Consultants
            $cName = $inv->trip_consultant ?: 'Unassigned';
            if (!isset($consultants[$cName])) $consultants[$cName] = ['revenue' => 0, 'pax' => 0];
            $consultants[$cName]['revenue'] += $rev;
            $consultants[$cName]['pax'] += $inv->trip_pax;

            // Top Clients
            $clName = $inv->customer_name ?: 'Client';
            if (!isset($topClients[$clName])) $topClients[$clName] = 0;
            $topClients[$clName] += $rev;

            // Status
            $st = $inv->status ?: 'unpaid';
            if (isset($paymentStatus[$st])) $paymentStatus[$st]++;
            else $paymentStatus['unpaid']++;
        }

        $invCount = $invoices->count();
        $aov = $invCount > 0 ? ($totalRevenue / $invCount) : 0;
        $collectionRate = $totalRevenue > 0 ? round(($totalDeposit / $totalRevenue) * 100) : 0;

        // Sort Top Trips
        uasort($topTrips, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        uasort($consultants, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        arsort($topClients);
        ksort($monthlyTrend);

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_deposit' => $totalDeposit,
                'total_balance' => $totalBalance,
                'total_invoices' => $invCount,
                'total_pax' => $totalPax,
                'average_order_value' => $aov,
                'collection_rate' => $collectionRate
            ],
            'monthly_trend' => $monthlyTrend,
            'top_trips' => array_slice($topTrips, 0, 8, true),
            'consultants' => $consultants,
            'top_clients' => array_slice($topClients, 0, 8, true),
            'payment_status' => $paymentStatus
        ]);
    }
}
