<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique()->index();
            $table->date('invoice_date')->index();
            $table->date('due_date')->nullable()->index();
            
            // Company Details
            $table->string('company_name')->nullable()->index();
            $table->text('company_address')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_license')->nullable();
            $table->string('company_website')->nullable();
            
            // Customer Details
            $table->string('customer_name')->index();
            $table->text('customer_address')->nullable();
            $table->string('customer_social')->nullable();
            
            // Trip / Booking Details
            $table->string('trip_name')->nullable()->index();
            $table->string('trip_date')->nullable();
            $table->string('trip_consultant')->nullable()->index();
            $table->integer('trip_pax')->default(1);
            $table->string('group_size')->nullable();
            $table->string('payment_terms')->nullable()->default('FULL PAYMENT');
            $table->string('payment_mode')->nullable()->default('ONLINE BANKING');
            
            // Financials
            $table->string('currency', 10)->default('RM');
            $table->decimal('exchange_rate', 14, 6)->default(1.0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('deposit_paid', 15, 2)->default(0);
            $table->decimal('balance_due', 15, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->boolean('tax_enabled')->default(false);
            
            // Status & Approvals
            $table->string('status', 20)->default('unpaid')->index(); // 'paid', 'partial', 'unpaid', 'overdue'
            $table->string('approved_by')->nullable();
            
            // Inclusions & Raw Snapshots
            $table->json('package_includes')->nullable();
            $table->json('items_data')->nullable();
            $table->json('addons_data')->nullable();
            $table->json('raw_draft')->nullable();
            
            $table->timestamps();
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->string('type', 20)->default('package'); // 'package' or 'addon'
            $table->string('description');
            $table->string('vi_description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
