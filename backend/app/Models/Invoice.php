<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'exchange_rate' => 'float',
        'subtotal' => 'float',
        'deposit_paid' => 'float',
        'balance_due' => 'float',
        'tax_percent' => 'float',
        'tax_enabled' => 'boolean',
        'trip_pax' => 'integer',
        'package_includes' => 'array',
        'items_data' => 'array',
        'addons_data' => 'array',
        'raw_draft' => 'array',
    ];

    /**
     * Relationship: Line items
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Scope for status filtering
     */
    public function scopeStatus($query, $status)
    {
        if (!empty($status)) {
            return $query->where('status', $status);
        }
        return $query;
    }

    /**
     * Calculate Normalized MYR Amount based on exchange rate
     */
    public function getNormalizedSubtotalAttribute(): float
    {
        $rate = $this->exchange_rate ?: 1.0;
        return ($rate != 1.0) ? ($this->subtotal / $rate) : $this->subtotal;
    }
}
