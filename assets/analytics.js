/**
 * ==============================================================================
 * E-INVOICE TRAVEL - ANALYTICS & VISUALIZATION ENGINE
 * ==============================================================================
 */

// Global State
let parsedInvoices = [];
let filteredInvoices = [];
let charts = {};
let currentSortColumn = 'date';
let currentSortAsc = false;
let currentPage = 1;
const rowsPerPage = 10;

// Default Exchange Rates (Matching Generator)
const currencyRates = {
    "RM": { rate: 1, code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    "MYR": { rate: 1, code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    "$": { rate: 0.23, code: "USD", symbol: "$", name: "US Dollar" },
    "USD": { rate: 0.23, code: "USD", symbol: "$", name: "US Dollar" },
    "€": { rate: 0.21, code: "EUR", symbol: "€", name: "Euro" },
    "EUR": { rate: 0.21, code: "EUR", symbol: "€", name: "Euro" },
    "£": { rate: 0.18, code: "GBP", symbol: "£", name: "British Pound" },
    "GBP": { rate: 0.18, code: "GBP", symbol: "£", name: "British Pound" },
    "S$": { rate: 0.31, code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    "SGD": { rate: 0.31, code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    "A$": { rate: 0.35, code: "AUD", symbol: "A$", name: "Australian Dollar" },
    "AUD": { rate: 0.35, code: "AUD", symbol: "A$", name: "Australian Dollar" },
    "¥": { rate: 36.5, code: "JPY", symbol: "¥", name: "JPY / CNY" },
    "JPY": { rate: 36.5, code: "JPY", symbol: "¥", name: "JPY" },
    "Rp": { rate: 3750, code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    "IDR": { rate: 3750, code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    "₹": { rate: 20, code: "INR", symbol: "₹", name: "Indian Rupee" },
    "INR": { rate: 20, code: "INR", symbol: "₹", name: "Indian Rupee" },
    "฿": { rate: 7.85, code: "THB", symbol: "฿", name: "Thai Baht" },
    "THB": { rate: 7.85, code: "THB", symbol: "฿", name: "Thai Baht" },
    "₫": { rate: 6350, code: "VND", symbol: "₫", name: "Vietnamese Dong" },
    "VND": { rate: 6350, code: "VND", symbol: "₫", name: "Vietnamese Dong" }
};

// Dynamic Environment & API Base Resolver
function getApiBaseUrl() {
    const customEndpoint = (localStorage.getItem('custom_cloud_api') || '').trim();
    if (customEndpoint) {
        return customEndpoint.replace(/\/+$/, '');
    }

    const host = window.location.hostname;
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host === '::1' || window.location.protocol === 'file:';
    if (isLocal) {
        return 'http://127.0.0.1:8001/api';
    }

    // On live static host (e.g. GitHub Pages) with no cloud backend URL configured
    return null;
}

// API Configuration Modal Logic
function openApiConfigModal() {
    const modal = document.getElementById('apiConfigModal');
    const input = document.getElementById('cfgApiBaseUrl');
    const statusBox = document.getElementById('apiTestStatus');
    if (!modal || !input) return;

    input.value = localStorage.getItem('custom_cloud_api') || '';
    if (statusBox) {
        statusBox.className = 'p-2 mb-3 rounded small d-none';
        statusBox.innerHTML = '';
    }
    modal.classList.add('show');
}

function closeApiConfigModal() {
    const modal = document.getElementById('apiConfigModal');
    if (modal) modal.classList.remove('show');
}

async function testApiConnection() {
    const input = document.getElementById('cfgApiBaseUrl');
    const statusBox = document.getElementById('apiTestStatus');
    if (!input || !statusBox) return;

    let targetUrl = (input.value || '').trim();
    if (!targetUrl) {
        const defaultBase = getApiBaseUrl();
        if (!defaultBase) {
            statusBox.className = 'p-2 mb-3 rounded small bg-warning text-dark';
            statusBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Please enter your live Cloud API URL (e.g., <code>https://your-api.onrender.com/api</code>).';
            return;
        }
        targetUrl = defaultBase;
    }
    targetUrl = targetUrl.replace(/\/+$/, '');

    statusBox.className = 'p-2 mb-3 rounded small bg-info text-white';
    statusBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Testing connection to backend & Neon DB...';

    try {
        const res = await fetch(`${targetUrl}/test-db`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (res.ok && data.database === 'connected') {
            statusBox.className = 'p-2 mb-3 rounded small bg-success text-white';
            statusBox.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Connected successfully! Neon DB has ${data.invoices_count || 0} invoices.`;
        } else {
            statusBox.className = 'p-2 mb-3 rounded small bg-warning text-dark';
            statusBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Server online, but database returned: ${data.message || 'Check database URL'}`;
        }
    } catch (err) {
        statusBox.className = 'p-2 mb-3 rounded small bg-danger text-white';
        statusBox.innerHTML = `<i class="fa-solid fa-circle-xmark me-1"></i> Could not connect to <code>${targetUrl}</code>. Ensure the server is live with CORS enabled.`;
    }
}

function saveApiConfig() {
    const input = document.getElementById('cfgApiBaseUrl');
    if (!input) return;

    const url = (input.value || '').trim().replace(/\/+$/, '');
    if (url) {
        localStorage.setItem('custom_cloud_api', url);
        showToast(`Connected to Cloud API: ${url}`, "success", 4000);
    } else {
        localStorage.removeItem('custom_cloud_api');
        showToast("Switched back to default environment detection.", "info", 3000);
    }
    closeApiConfigModal();

    // Trigger auto sync with newly configured endpoint
    if (typeof syncFromNeonCloud === 'function') {
        syncFromNeonCloud();
    }
}

function resetApiConfig() {
    localStorage.removeItem('custom_cloud_api');
    const input = document.getElementById('cfgApiBaseUrl');
    const statusBox = document.getElementById('apiTestStatus');
    if (input) input.value = '';
    if (statusBox) {
        statusBox.className = 'p-2 mb-3 rounded small bg-secondary text-white';
        statusBox.innerHTML = '<i class="fa-solid fa-info-circle me-1"></i> Reset to default local / client mode.';
    }
    showToast("API URL reset to default.", "info", 3000);
}

// Set up PDF.js Worker
if (typeof pdfjsLib !== 'undefined') {
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } catch (e) {
        console.warn("PDF.js worker setup note:", e);
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    initFilterListeners();
    initTableSearch();
    
    // Check if there are cached invoices in localStorage for instantaneous first paint
    const saved = localStorage.getItem('analytics_invoices_cache') || sessionStorage.getItem('analytics_invoices_cache');
    if (saved) {
        try {
            parsedInvoices = JSON.parse(saved);
            updateDashboard();
        } catch (e) {
            console.error(e);
        }
    }

    // Automatically sync live records from Neon Cloud DB on page load
    syncFromNeonCloud({ isAutoSync: true });
});

// Helper: Toast Notifications
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;

    let icon = '<i class="fa-solid fa-circle-info" style="color: #60a5fa; font-size: 18px;"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color: #4ade80; font-size: 18px;"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation" style="color: #f87171; font-size: 18px;"></i>';
    if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #fbbf24; font-size: 18px;"></i>';

    // Strip any raw emoji prefixes for a clean consistent look
    let cleanMsg = String(message).replace(/^[✅❌⚠️🗑️ℹ️⚡]\s*/, '');

    toast.innerHTML = `
        <div style="flex-shrink: 0; display: flex; align-items: center;">${icon}</div>
        <div class="flex-grow-1" style="line-height: 1.45; font-size: 13.5px; font-weight: 500;">${cleanMsg}</div>
        <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 10px; opacity: 0.7; flex-shrink: 0; cursor: pointer;" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Base64 JSON Decoder
function decodeInvoiceDataB64(str) {
    try {
        const decoded = decodeURIComponent(escape(atob(str.trim())));
        return JSON.parse(decoded);
    } catch (e) {
        try {
            return JSON.parse(atob(str.trim()));
        } catch (e2) {
            return null;
        }
    }
}

// Fast Embedded Binary Scanner
function extractRawEmbeddedData(arrayBuffer) {
    try {
        const uint8 = new Uint8Array(arrayBuffer);
        const len = uint8.length;
        if (!len) return null;

        let binaryStr = '';
        const chunkSize = 65536;
        for (let i = 0; i < len; i += chunkSize) {
            binaryStr += String.fromCharCode.apply(null, uint8.subarray(i, Math.min(i + chunkSize, len)));
        }

        const marker = "EINVOICE_DATA:";
        let idx = binaryStr.indexOf(marker);
        if (idx !== -1) {
            const rawSub = binaryStr.substring(idx + marker.length);
            const match = rawSub.match(/^([A-Za-z0-9+/=]+)/);
            if (match && match[1]) {
                const data = decodeInvoiceDataB64(match[1]);
                if (data && (data.invoiceNo || data.items || data.customerName || data.tripName)) {
                    return data;
                }
            }
        }
    } catch (err) {
        console.warn("Direct buffer scan skipped:", err);
    }
    return null;
}

// Text Parser for PDF content
async function parseInvoiceText(pdfDoc) {
    let fullText = "";
    const numPages = pdfDoc.numPages || 1;
    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += "\n" + pageText;
    }

    let extracted = {
        currency: "RM",
        companyName: "",
        invoiceNo: "",
        invoiceDate: "",
        dueDate: "",
        customerName: "",
        tripName: "",
        tripDate: "",
        tripPax: "1",
        tripConsultant: "",
        paymentTerms: "FULL PAYMENT",
        paymentMode: "ONLINE BANKING",
        depositPaid: 0,
        subtotal: 0,
        grandTotal: 0,
        items: [],
        addons: []
    };

    // Currency Detection
    if (/\b(?:VND|₫)\b/i.test(fullText)) extracted.currency = "₫";
    else if (/\b(?:USD|\$)\b/i.test(fullText) && !/SGD|AUD/i.test(fullText)) extracted.currency = "$";
    else if (/\b(?:EUR|€)\b/i.test(fullText)) extracted.currency = "€";
    else if (/\b(?:GBP|£)\b/i.test(fullText)) extracted.currency = "£";
    else if (/\b(?:SGD|S\$)\b/i.test(fullText)) extracted.currency = "S$";
    else if (/\b(?:AUD|A\$)\b/i.test(fullText)) extracted.currency = "A$";
    else if (/\b(?:JPY|CNY|¥)\b/i.test(fullText)) extracted.currency = "¥";
    else if (/\b(?:IDR|Rp)\b/i.test(fullText)) extracted.currency = "Rp";
    else if (/\b(?:INR|₹)\b/i.test(fullText)) extracted.currency = "₹";
    else if (/\b(?:THB|฿)\b/i.test(fullText)) extracted.currency = "฿";
    else extracted.currency = "RM";

    // Invoice No
    const invMatch = fullText.match(/(?:HÓA ĐƠN|INVOICE\s*(?:NO|NUMBER|#)?|HÓA ĐƠN SỐ|Số HĐ|Inv\s*#?)\s*[:#.\s]*([A-Z0-9\-\/]+)/i) ||
                     fullText.match(/\b(INV[-\/]\d{3,}[-\/]?\d*)\b/i) ||
                     fullText.match(/\b(INV\d{3,})\b/i);
    if (invMatch) extracted.invoiceNo = invMatch[1].trim();

    // Dates
    const dateMatches = fullText.match(/\b(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})\b/g);
    if (dateMatches && dateMatches.length > 0) {
        extracted.invoiceDate = normalizeDateStr(dateMatches[0]);
        if (dateMatches.length > 1) {
            extracted.dueDate = normalizeDateStr(dateMatches[1]);
        }
    }

    // Customer Name
    const custMatch = fullText.match(/(?:Khách hàng|Customer|Bill To|Tên khách hàng|Kính gửi|Client|Attn|Nama Pelanggan)\s*[:.\-]?\s*([^\n\r\t,]+?)(?=(?:Địa chỉ|Address|Số ĐT|Phone|Email|Ngày|Date|Thông tin|$))/i);
    if (custMatch && custMatch[1].trim().length > 1) {
        extracted.customerName = custMatch[1].trim();
    }

    // Company Name
    if (/SELAMATVN/i.test(fullText)) extracted.companyName = "SelamatVN Tour & Travel";
    else if (/LANTERA/i.test(fullText)) extracted.companyName = "Lantera Travel";
    else if (/JOM/i.test(fullText)) extracted.companyName = "Jom Travel";
    else if (/HARAREI/i.test(fullText)) extracted.companyName = "Hararei Travel";

    // Trip Name
    const tripMatch = fullText.match(/(?:Tên chuyến đi|Trip Name|Chương trình|Tour|Package|Gói tour|Pakej|Destination)\s*[:.\-]?\s*([^\n\r\t,]+?)(?=(?:Thời gian|Trip Date|Travel Date|Date|Số lượng|Pax|Tư vấn|$))/i);
    if (tripMatch && tripMatch[1].trim().length > 1) {
        extracted.tripName = tripMatch[1].trim();
    }

    // Pax
    const paxMatch = fullText.match(/(?:Số lượng khách|Total Pax|Số khách|Pax|Bilangan)\s*[:.\-]?\s*(\d+)/i);
    if (paxMatch) extracted.tripPax = parseInt(paxMatch[1]) || 1;

    // Consultant
    const consMatch = fullText.match(/(?:Tư vấn viên|Tour Consultant|Consultant|Sales|Perunding)\s*[:.\-]?\s*([A-Za-z\s]+?)(?=(?:Quy mô|Group Size|Thanh toán|$))/i);
    if (consMatch) extracted.tripConsultant = consMatch[1].trim();

    // Deposit Paid
    const depositMatch = fullText.match(/(?:Đã đặt cọc|Deposit Paid|Deposit|Đã thanh toán|Bayaran Deposit)\s*[:.\-]?\s*([\d,]+(?:\.\d{2})?)/i);
    if (depositMatch) {
        extracted.depositPaid = parseFloat(depositMatch[1].replace(/,/g, '')) || 0;
    }

    // Line items
    const itemPattern = /(?:(\d+)\s+)?([A-Za-z0-9\s\/\-\(\)]+?)\s+(\d+)\s+Pax\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+(?:\.\d{2})?)/gi;
    let match;
    let calculatedSubtotal = 0;
    while ((match = itemPattern.exec(fullText)) !== null) {
        const desc = match[2].trim();
        const qty = parseInt(match[3]) || 1;
        const price = parseFloat(match[4].replace(/,/g, '')) || 0;
        const total = parseFloat(match[5].replace(/,/g, '')) || (price * qty);
        if (!/^(STT|Item|No|Total|Subtotal)/i.test(desc)) {
            extracted.items.push({ desc, qty, price, total });
            calculatedSubtotal += total;
        }
    }

    // Grand Total search if lines missed
    const grandMatch = fullText.match(/(?:TỔNG CỘNG|TOTAL AMOUNT|GRAND TOTAL|TỔNG TIỀN)\s*[:.\-]?\s*(?:[A-Z$€£¥₫Rp₹฿]+\s*)?([\d,]+(?:\.\d{2})?)/i);
    if (grandMatch) {
        extracted.grandTotal = parseFloat(grandMatch[1].replace(/,/g, '')) || calculatedSubtotal;
    } else {
        extracted.grandTotal = calculatedSubtotal;
    }
    extracted.subtotal = calculatedSubtotal || extracted.grandTotal;

    return extracted;
}

function normalizeDateStr(dStr) {
    if (!dStr) return new Date().toISOString().split('T')[0];
    const parts = dStr.split(/[-\/.]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dStr;
}

// Convert Any Raw Invoice Data to Standard Normalized Object
function normalizeInvoiceRecord(raw, fileName = "") {
    if (!raw) return null;
    const currency = raw.currency || "RM";
    const curInfo = currencyRates[currency] || { rate: 1, symbol: currency, code: currency };
    const exchangeRate = raw.exchangeRate || curInfo.rate || 1.0;

    let subtotal = 0;
    let totalPax = 0;

    if (Array.isArray(raw.items)) {
        raw.items.forEach(item => {
            const p = parseFloat(String(item.price || 0).replace(/,/g, '')) || 0;
            const q = parseInt(item.qty || 1) || 0;
            subtotal += (p * q);
            if (/(ADULT|CHILD|PAX|GÓI|PACKAGE)/i.test(item.desc || '')) {
                totalPax += q;
            }
        });
    }

    if (Array.isArray(raw.addons)) {
        raw.addons.forEach(item => {
            const p = parseFloat(String(item.price || 0).replace(/,/g, '')) || 0;
            const q = parseInt(item.qty || 1) || 0;
            subtotal += (p * q);
        });
    }

    if (raw.grandTotal && parseFloat(raw.grandTotal) > 0) {
        subtotal = parseFloat(raw.grandTotal);
    } else if (raw.subtotal && parseFloat(raw.subtotal) > 0 && subtotal === 0) {
        subtotal = parseFloat(raw.subtotal);
    }

    const deposit = parseFloat(String(raw.depositPaid || 0).replace(/,/g, '')) || 0;
    const balance = Math.max(0, subtotal - deposit);

    // Check for saved status override in localStorage
    let savedStatusOverrides = {};
    try {
        savedStatusOverrides = JSON.parse(localStorage.getItem('analytics_status_overrides') || '{}');
    } catch (e) {}

    const invKey = raw.invoiceNo || raw.id || fileName;
    const overriddenStatus = (raw.invoiceNo && savedStatusOverrides[raw.invoiceNo]) ? savedStatusOverrides[raw.invoiceNo] : (savedStatusOverrides[invKey] || null);

    let status = 'unpaid';
    if (overriddenStatus) {
        status = overriddenStatus;
    } else if (raw.status) {
        const s = String(raw.status).toLowerCase().trim();
        if (s === 'paid' || s === 'partial' || s === 'unpaid') {
            status = s;
        } else {
            status = 'unpaid';
        }
    } else if (deposit >= subtotal && subtotal > 0) {
        status = 'paid';
    } else if (deposit > 0) {
        status = 'partial';
    } else {
        status = 'unpaid';
    }

    if (!totalPax && raw.tripPax) {
        totalPax = parseInt(raw.tripPax) || 1;
    }
    if (!totalPax) totalPax = 1;

    // Normalized amount in base MYR
    const normalizedSubtotalMYR = (exchangeRate && exchangeRate !== 1) ? (subtotal / exchangeRate) : subtotal;
    const normalizedDepositMYR = (exchangeRate && exchangeRate !== 1) ? (deposit / exchangeRate) : deposit;
    const normalizedBalanceMYR = (exchangeRate && exchangeRate !== 1) ? (balance / exchangeRate) : balance;

    const todayStr = new Date().toISOString().split('T')[0];

    return {
        id: raw.invoiceNo || `INV-${Math.floor(Math.random() * 90000) + 10000}`,
        invoiceNo: raw.invoiceNo || "N/A",
        fileName: fileName,
        companyName: raw.companyName || "SELAMATVN TOUR AND TRAVEL",
        customerName: raw.customerName || "Valued Client",
        tripName: raw.tripName || "Vietnam Discovery Tour",
        tripDate: raw.tripDate || "",
        tripConsultant: raw.tripConsultant || "General Sales",
        invoiceDate: raw.invoiceDate || todayStr,
        dueDate: raw.dueDate || raw.invoiceDate || todayStr,
        currency: currency,
        symbol: curInfo.symbol || currency,
        exchangeRate: exchangeRate,
        pax: totalPax,
        subtotal: subtotal,
        depositPaid: deposit,
        balanceDue: balance,
        status: status,
        normalizedSubtotalMYR: normalizedSubtotalMYR,
        normalizedDepositMYR: normalizedDepositMYR,
        normalizedBalanceMYR: normalizedBalanceMYR,
        backendId: raw.backendId || (typeof raw.id === 'number' ? raw.id : null),
        raw: raw
    };
}

// Single File Processor (.PDF or .INV)
async function processFile(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.inv') || file.type === 'application/json') {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const raw = JSON.parse(e.target.result);
                    resolve(normalizeInvoiceRecord(raw, file.name));
                } catch (err) {
                    console.error("JSON parse error:", err);
                    resolve(null);
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
        });
    }

    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();

            // Direct binary recovery
            const direct = extractRawEmbeddedData(arrayBuffer);
            if (direct) {
                return normalizeInvoiceRecord(direct, file.name);
            }

            // PDF.js parse
            if (typeof pdfjsLib !== 'undefined') {
                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                    cMapPacked: true
                });
                const pdfDoc = await loadingTask.promise;

                // Check PDF metadata
                try {
                    const meta = await pdfDoc.getMetadata();
                    if (meta && meta.info) {
                        for (const [k, val] of Object.entries(meta.info)) {
                            if (typeof val === 'string' && val.includes("EINVOICE_DATA:")) {
                                const rawB64 = val.substring(val.indexOf("EINVOICE_DATA:") + 14).trim();
                                const data = decodeInvoiceDataB64(rawB64);
                                if (data) return normalizeInvoiceRecord(data, file.name);
                            }
                        }
                    }
                } catch (metaErr) {}

                // Text parse
                const parsed = await parseInvoiceText(pdfDoc);
                return normalizeInvoiceRecord(parsed, file.name);
            }
        } catch (err) {
            console.warn(`Failed parsing PDF ${file.name}:`, err);
            return null;
        }
    }

    return null;
}

// Traverse FileSystem Entries (Recursive folder scan for drag-and-drop folders)
async function scanFilesFromEntry(entry) {
    let files = [];
    if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve));
        if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.inv'))) {
            files.push(file);
        }
    } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise((resolve) => {
            dirReader.readEntries(resolve, () => resolve([]));
        });
        for (const childEntry of entries) {
            const nested = await scanFilesFromEntry(childEntry);
            files = files.concat(nested);
        }
    }
    return files;
}

// Bulk Files Handler
async function handleBatchFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const progressBox = document.getElementById('processingProgress');
    const progressBar = document.getElementById('progressBarFill');
    const progressPct = document.getElementById('progressPercent');
    const progressSubtext = document.getElementById('progressSubtext');

    if (progressBox) progressBox.style.display = 'block';

    const totalFiles = fileList.length;
    let processedCount = 0;
    let newInvoices = [];

    for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        if (progressSubtext) progressSubtext.innerText = `Parsing file: ${file.name}...`;

        try {
            const record = await processFile(file);
            if (record && (record.invoiceNo || record.customerName || record.subtotal >= 0 || (record.items && record.items.length > 0))) {
                newInvoices.push(record);
            }
        } catch (err) {
            console.error(`Error processing file ${file.name}:`, err);
        }

        processedCount++;
        const pct = Math.round((processedCount / totalFiles) * 100);
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressPct) progressPct.innerText = `${pct}%`;
    }

    setTimeout(() => {
        if (progressBox) progressBox.style.display = 'none';
    }, 600);

    if (newInvoices.length > 0) {
        // Use Map to merge / update existing records
        const invoiceMap = new Map();
        parsedInvoices.forEach(inv => {
            const key = (inv.invoiceNo && inv.invoiceNo !== 'N/A') ? inv.invoiceNo : (inv.id || inv.fileName);
            invoiceMap.set(key, inv);
        });
        newInvoices.forEach(inv => {
            const key = (inv.invoiceNo && inv.invoiceNo !== 'N/A') ? inv.invoiceNo : (inv.id || inv.fileName);
            invoiceMap.set(key, inv);
        });

        parsedInvoices = Array.from(invoiceMap.values());
        sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));

        showToast(`Successfully analyzed ${newInvoices.length} invoice(s)!`, "success");
        populateFilterDropdowns();
        updateDashboard();
    } else {
        showToast("No valid invoice PDF or .inv files were recognized.", "warning");
    }
}

// Initialize Drag & Drop
function initDragAndDrop() {
    const dropzone = document.getElementById('bulkDropZone');
    const fileInput = document.getElementById('bulkFileInput');
    const folderInput = document.getElementById('bulkFolderInput');

    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', async (e) => {
        const items = e.dataTransfer.items;
        let files = [];

        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.webkitGetAsEntry) {
                    const entry = item.webkitGetAsEntry();
                    if (entry) {
                        const scanned = await scanFilesFromEntry(entry);
                        files = files.concat(scanned);
                        continue;
                    }
                }
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        } else if (e.dataTransfer.files) {
            files = Array.from(e.dataTransfer.files);
        }

        if (files.length > 0) {
            handleBatchFiles(files);
        }
    });

    // Clicking anywhere on dropzone (except inner buttons/inputs) opens file dialog
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) {
            return;
        }
        if (fileInput) {
            fileInput.click();
        }
    });

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleBatchFiles(Array.from(e.target.files));
            }
            e.target.value = '';
        });
    }

    if (folderInput) {
        folderInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleBatchFiles(Array.from(e.target.files));
            }
            e.target.value = '';
        });
    }
}

// Populate Filter Select Boxes dynamically
function populateFilterDropdowns() {
    const companySelect = document.getElementById('filterCompany');
    const consultantSelect = document.getElementById('filterConsultant');
    const tripSelect = document.getElementById('filterTrip');

    const companies = new Set();
    const consultants = new Set();
    const trips = new Set();

    parsedInvoices.forEach(inv => {
        if (inv.companyName) companies.add(inv.companyName);
        if (inv.tripConsultant) consultants.add(inv.tripConsultant);
        if (inv.tripName) trips.add(inv.tripName);
    });

    if (companySelect) {
        const current = companySelect.value;
        companySelect.innerHTML = '<option value="">All Companies</option>' + 
            Array.from(companies).map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
    }

    if (consultantSelect) {
        const current = consultantSelect.value;
        consultantSelect.innerHTML = '<option value="">All Consultants</option>' + 
            Array.from(consultants).map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
    }

    if (tripSelect) {
        const current = tripSelect.value;
        tripSelect.innerHTML = '<option value="">All Trips / Packages</option>' + 
            Array.from(trips).map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`).join('');
    }
}

// Setup Filters
function initFilterListeners() {
    ['filterDateRange', 'filterCompany', 'filterConsultant', 'filterTrip', 'filterStatus', 'currencyToggle'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateDashboard);
    });
}

function initTableSearch() {
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });
    }
}

// Apply Filters
function getFilteredData() {
    const dateRange = document.getElementById('filterDateRange')?.value || 'all';
    const company = document.getElementById('filterCompany')?.value || '';
    const consultant = document.getElementById('filterConsultant')?.value || '';
    const trip = document.getElementById('filterTrip')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const now = new Date();
    let startDate = null;

    if (dateRange === '30days') {
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    } else if (dateRange === '90days') {
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    } else if (dateRange === 'thisYear') {
        startDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateRange === 'thisMonth') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return parsedInvoices.filter(inv => {
        if (company && inv.companyName !== company) return false;
        if (consultant && inv.tripConsultant !== consultant) return false;
        if (trip && inv.tripName !== trip) return false;
        if (status && inv.status !== status) return false;

        if (startDate && inv.invoiceDate) {
            const invD = new Date(inv.invoiceDate);
            if (invD < startDate) return false;
        }
        return true;
    });
}

// Main Dashboard Update Handler
function updateDashboard() {
    filteredInvoices = getFilteredData();

    const emptyState = document.getElementById('emptyStateContainer');
    const analyticsContent = document.getElementById('analyticsDashboardContent');

    if (parsedInvoices.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (analyticsContent) analyticsContent.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (analyticsContent) analyticsContent.style.display = 'block';

    updateKPICards();
    renderCharts();
    renderTable();
}

// KPI Calculations
function updateKPICards() {
    const isBaseMYR = (document.getElementById('currencyToggle')?.value || 'MYR') === 'MYR';
    const curSymbol = isBaseMYR ? 'RM' : '$';

    let totalRevenue = 0;
    let totalDeposit = 0;
    let totalBalance = 0;
    let totalPax = 0;

    const tripsCount = {};
    const consultantsRevenue = {};

    filteredInvoices.forEach(inv => {
        const rev = isBaseMYR ? inv.normalizedSubtotalMYR : (inv.normalizedSubtotalMYR * 0.23);
        const dep = isBaseMYR ? inv.normalizedDepositMYR : (inv.normalizedDepositMYR * 0.23);
        const bal = isBaseMYR ? inv.normalizedBalanceMYR : (inv.normalizedBalanceMYR * 0.23);

        totalRevenue += rev;
        totalDeposit += dep;
        totalBalance += bal;
        totalPax += inv.pax;

        tripsCount[inv.tripName] = (tripsCount[inv.tripName] || 0) + 1;
        consultantsRevenue[inv.tripConsultant] = (consultantsRevenue[inv.tripConsultant] || 0) + rev;
    });

    const invCount = filteredInvoices.length;
    const aov = invCount > 0 ? (totalRevenue / invCount) : 0;
    const collectionRate = totalRevenue > 0 ? Math.round((totalDeposit / totalRevenue) * 100) : 0;

    // Top package
    let topTrip = "N/A";
    let maxTripCount = 0;
    for (const [tName, count] of Object.entries(tripsCount)) {
        if (count > maxTripCount) {
            maxTripCount = count;
            topTrip = tName;
        }
    }

    // Top consultant
    let topCons = "N/A";
    let maxConsRev = 0;
    for (const [cName, rev] of Object.entries(consultantsRevenue)) {
        if (rev > maxConsRev) {
            maxConsRev = rev;
            topCons = cName;
        }
    }

    // Set UI elements
    const formatNum = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('kpiTotalRevenue').innerText = `${curSymbol} ${formatNum(totalRevenue)}`;
    document.getElementById('kpiCollectedText').innerText = `Collected: ${curSymbol} ${formatNum(totalDeposit)} (${collectionRate}%)`;
    document.getElementById('kpiPendingText').innerText = `Balance Due: ${curSymbol} ${formatNum(totalBalance)}`;

    document.getElementById('kpiTotalInvoices').innerText = invCount.toLocaleString();
    document.getElementById('kpiAOV').innerText = `Avg Value: ${curSymbol} ${formatNum(aov)}`;

    document.getElementById('kpiTotalPax').innerText = totalPax.toLocaleString();
    document.getElementById('kpiPaxAvg').innerText = `Avg ${(totalPax / (invCount || 1)).toFixed(1)} pax / invoice`;

    document.getElementById('kpiCollectionRate').innerText = `${collectionRate}%`;
    const rateBar = document.getElementById('kpiCollectionBar');
    if (rateBar) rateBar.style.width = `${collectionRate}%`;

    document.getElementById('kpiTopTrip').innerText = topTrip;
    document.getElementById('kpiTopTripSub').innerText = `${maxTripCount} booking(s)`;

    document.getElementById('kpiTopConsultant').innerText = topCons;
    document.getElementById('kpiTopConsultantSub').innerText = `${curSymbol} ${formatNum(maxConsRev)} gross`;
}

// Chart Render Engine (Chart.js)
function renderCharts() {
    const isBaseMYR = (document.getElementById('currencyToggle')?.value || 'MYR') === 'MYR';
    const curSymbol = isBaseMYR ? 'RM' : '$';

    // 1. Revenue & Invoices Trend
    renderTimelineChart(curSymbol, isBaseMYR);

    // 2. Top Trips / Destinations
    renderTopTripsChart(curSymbol, isBaseMYR);

    // 3. Payment Status Breakdown
    renderPaymentDonutChart();

    // 4. Consultant Performance
    renderConsultantChart(curSymbol, isBaseMYR);

    // 5. Client Agency Distribution
    renderClientChart(curSymbol, isBaseMYR);

    // 6. Addon / Service Breakdown
    renderAddonChart();
}

function renderTimelineChart(curSymbol, isBaseMYR) {
    const ctx = document.getElementById('chartTimeline')?.getContext('2d');
    if (!ctx) return;

    if (charts.timeline) charts.timeline.destroy();

    // Group by month
    const monthlyData = {};
    filteredInvoices.forEach(inv => {
        const monthKey = inv.invoiceDate ? inv.invoiceDate.substring(0, 7) : 'Unknown';
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, count: 0, deposit: 0 };
        }
        const rev = isBaseMYR ? inv.normalizedSubtotalMYR : (inv.normalizedSubtotalMYR * 0.23);
        const dep = isBaseMYR ? inv.normalizedDepositMYR : (inv.normalizedDepositMYR * 0.23);
        monthlyData[monthKey].revenue += rev;
        monthlyData[monthKey].deposit += dep;
        monthlyData[monthKey].count += 1;
    });

    const labels = Object.keys(monthlyData).sort();
    const revSeries = labels.map(l => monthlyData[l].revenue);
    const depSeries = labels.map(l => monthlyData[l].deposit);
    const countSeries = labels.map(l => monthlyData[l].count);

    charts.timeline = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Gross Revenue (${curSymbol})`,
                    data: revSeries,
                    backgroundColor: 'rgba(239, 108, 0, 0.85)',
                    borderRadius: 6,
                    maxBarThickness: 45,
                    yAxisID: 'y'
                },
                {
                    label: `Deposit Collected (${curSymbol})`,
                    data: depSeries,
                    backgroundColor: 'rgba(16, 185, 129, 0.85)',
                    borderRadius: 6,
                    maxBarThickness: 45,
                    yAxisID: 'y'
                },
                {
                    label: 'Invoices Count',
                    data: countSeries,
                    type: 'line',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.35,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, padding: 12, font: { weight: '600', size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.yAxisID === 'y') {
                                return `${context.dataset.label}: ${curSymbol} ${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                            }
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#f1f5f9' },
                    ticks: { callback: (val) => `${curSymbol} ${val.toLocaleString()}` }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderTopTripsChart(curSymbol, isBaseMYR) {
    const ctx = document.getElementById('chartTopTrips')?.getContext('2d');
    if (!ctx) return;

    if (charts.topTrips) charts.topTrips.destroy();

    const tripAgg = {};
    filteredInvoices.forEach(inv => {
        const name = inv.tripName || 'Other';
        if (!tripAgg[name]) tripAgg[name] = { revenue: 0, pax: 0 };
        const rev = isBaseMYR ? inv.normalizedSubtotalMYR : (inv.normalizedSubtotalMYR * 0.23);
        tripAgg[name].revenue += rev;
        tripAgg[name].pax += inv.pax;
    });

    const sorted = Object.entries(tripAgg)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 7);

    const labels = sorted.map(s => s[0].length > 25 ? s[0].substring(0, 25) + '...' : s[0]);
    const revenues = sorted.map(s => s[1].revenue);

    charts.topTrips = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Revenue (${curSymbol})`,
                data: revenues,
                backgroundColor: [
                    '#EF6C00', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed'
                ],
                borderRadius: 6,
                maxBarThickness: 24
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Revenue: ${curSymbol} ${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#f1f5f9' },
                    ticks: { callback: (val) => `${curSymbol} ${val.toLocaleString()}` }
                },
                y: { grid: { display: false } }
            }
        }
    });
}

function renderPaymentDonutChart() {
    const ctx = document.getElementById('chartPaymentStatus')?.getContext('2d');
    if (!ctx) return;

    if (charts.paymentStatus) charts.paymentStatus.destroy();

    let paid = 0;
    let partial = 0;
    let unpaid = 0;

    filteredInvoices.forEach(inv => {
        if (inv.status === 'paid') paid++;
        else if (inv.status === 'partial') partial++;
        else unpaid++;
    });

    charts.paymentStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Partial Deposit', 'Unpaid'],
            datasets: [{
                data: [paid, partial, unpaid],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        padding: 12,
                        font: { weight: '600', size: 10.5 }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderConsultantChart(curSymbol, isBaseMYR) {
    const ctx = document.getElementById('chartConsultants')?.getContext('2d');
    if (!ctx) return;

    if (charts.consultants) charts.consultants.destroy();

    const consMap = {};
    filteredInvoices.forEach(inv => {
        const c = inv.tripConsultant || 'Unassigned';
        if (!consMap[c]) consMap[c] = { revenue: 0, pax: 0 };
        const rev = isBaseMYR ? inv.normalizedSubtotalMYR : (inv.normalizedSubtotalMYR * 0.23);
        consMap[c].revenue += rev;
        consMap[c].pax += inv.pax;
    });

    const sorted = Object.entries(consMap).sort((a, b) => b[1].revenue - a[1].revenue);
    const labels = sorted.map(s => s[0]);
    const revenues = sorted.map(s => s[1].revenue);

    charts.consultants = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total Sales (${curSymbol})`,
                data: revenues,
                backgroundColor: '#6366f1',
                borderRadius: 6,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Sales: ${curSymbol} ${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: { callback: (val) => `${curSymbol} ${val.toLocaleString()}` }
                }
            }
        }
    });
}

function renderClientChart(curSymbol, isBaseMYR) {
    const ctx = document.getElementById('chartTopClients')?.getContext('2d');
    if (!ctx) return;

    if (charts.clients) charts.clients.destroy();

    const clientMap = {};
    filteredInvoices.forEach(inv => {
        const c = inv.customerName || 'General Client';
        if (!clientMap[c]) clientMap[c] = 0;
        const rev = isBaseMYR ? inv.normalizedSubtotalMYR : (inv.normalizedSubtotalMYR * 0.23);
        clientMap[c] += rev;
    });

    const sorted = Object.entries(clientMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const labels = sorted.map(s => s[0]);
    const values = sorted.map(s => s[1]);

    charts.clients = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(239, 108, 0, 0.75)',
                    'rgba(59, 130, 246, 0.75)',
                    'rgba(16, 185, 129, 0.75)',
                    'rgba(139, 92, 246, 0.75)',
                    'rgba(245, 158, 11, 0.75)',
                    'rgba(236, 72, 153, 0.75)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } }
            }
        }
    });
}

function renderAddonChart() {
    const ctx = document.getElementById('chartAddons')?.getContext('2d');
    if (!ctx) return;

    if (charts.addons) charts.addons.destroy();

    const addonMap = { 'Meals Included': 0, 'Transport/Flight': 0, 'Hotel Booking': 0, 'Ticket Activity': 0 };
    filteredInvoices.forEach(inv => {
        const inc = inv.raw?.packageIncludes;
        if (inc) {
            if (inc.meals) addonMap['Meals Included']++;
            if (inc.transport) addonMap['Transport/Flight']++;
            if (inc.hotel) addonMap['Hotel Booking']++;
            if (inc.ticket) addonMap['Ticket Activity']++;
        }
    });

    charts.addons = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(addonMap),
            datasets: [{
                label: 'Invoices Including Service',
                data: Object.values(addonMap),
                backgroundColor: '#0ea5e9',
                borderRadius: 6,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Invoices Table Renderer
function renderTable() {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;

    const query = (document.getElementById('tableSearchInput')?.value || '').toLowerCase().trim();
    let displayList = filteredInvoices.filter(inv => {
        if (!query) return true;
        return inv.invoiceNo.toLowerCase().includes(query) ||
               inv.customerName.toLowerCase().includes(query) ||
               inv.tripName.toLowerCase().includes(query) ||
               inv.tripConsultant.toLowerCase().includes(query);
    });

    // Sorting
    displayList.sort((a, b) => {
        let vA = a[currentSortColumn];
        let vB = b[currentSortColumn];
        if (typeof vA === 'string') vA = vA.toLowerCase();
        if (typeof vB === 'string') vB = vB.toLowerCase();
        if (vA < vB) return currentSortAsc ? -1 : 1;
        if (vA > vB) return currentSortAsc ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalItems = displayList.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pagedList = displayList.slice(startIdx, startIdx + rowsPerPage);

    // Update pagination UI
    document.getElementById('tableItemCount').innerText = `Showing ${Math.min(startIdx + 1, totalItems)} - ${Math.min(startIdx + rowsPerPage, totalItems)} of ${totalItems} invoices`;
    document.getElementById('tablePageNum').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('btnPrevPage').disabled = (currentPage <= 1);
    document.getElementById('btnNextPage').disabled = (currentPage >= totalPages);

    if (pagedList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No invoices found matching current filter or search criteria.</td></tr>`;
        return;
    }

    const isBaseMYR = (document.getElementById('currencyToggle')?.value || 'MYR') === 'MYR';

    tbody.innerHTML = pagedList.map(inv => {
        const cur = isBaseMYR ? 'RM' : inv.symbol;
        const total = isBaseMYR ? inv.normalizedSubtotalMYR : inv.subtotal;
        const dep = isBaseMYR ? inv.normalizedDepositMYR : inv.depositPaid;
        const bal = isBaseMYR ? inv.normalizedBalanceMYR : inv.balanceDue;

        return `
            <tr>
                <td class="fw-bold text-primary">${inv.invoiceNo}</td>
                <td>${inv.invoiceDate}</td>
                <td>
                    <div class="fw-bold">${inv.customerName}</div>
                    <div class="text-muted small">${inv.companyName}</div>
                </td>
                <td>
                    <div>${inv.tripName}</div>
                    <div class="text-muted small"><i class="fa-solid fa-user-tie me-1"></i>${inv.tripConsultant}</div>
                </td>
                <td class="text-center font-monospace">${inv.pax}</td>
                <td class="fw-bold">${cur} ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="text-success">${cur} ${dep.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="text-danger fw-bold">${cur} ${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                    <select class="status-select status-select-${inv.status || 'unpaid'}"
                            onchange="onInvoiceStatusChange('${inv.id}', this.value)"
                            title="Select Payment Status">
                        <option value="unpaid" ${(inv.status === 'unpaid' || !inv.status) ? 'selected' : ''}>Unpaid</option>
                        <option value="partial" ${inv.status === 'partial' ? 'selected' : ''}>Partial</option>
                        <option value="paid" ${inv.status === 'paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="table-action-btn" title="View Details" onclick="openInvoiceModal('${inv.id}')"><i class="fa-solid fa-eye"></i></button>
                        <button class="table-action-btn" title="Edit in Generator" onclick="openInGenerator('${inv.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="table-action-btn delete-btn" title="Soft Delete Invoice" onclick="softDeleteInvoice('${inv.id}')"><i class="fa-solid fa-trash-can text-danger"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Table Sorting Trigger
function sortTable(column) {
    if (currentSortColumn === column) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortColumn = column;
        currentSortAsc = true;
    }
    renderTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    currentPage++;
    renderTable();
}

// Interactive Status Dropdown Change Handler
async function onInvoiceStatusChange(id, newStatus) {
    const inv = parsedInvoices.find(i => i.id === id || i.invoiceNo === id || i.backendId == id);
    if (!inv) return;

    inv.status = newStatus;
    if (inv.raw) inv.raw.status = newStatus;

    // Update in filtered list
    const fInv = filteredInvoices.find(i => i.id === id || i.invoiceNo === id || i.backendId == id);
    if (fInv) {
        fInv.status = newStatus;
        if (fInv.raw) fInv.raw.status = newStatus;
    }

    // Persist status override in localStorage
    try {
        const overrides = JSON.parse(localStorage.getItem('analytics_status_overrides') || '{}');
        if (inv.invoiceNo && inv.invoiceNo !== 'N/A') {
            overrides[inv.invoiceNo] = newStatus;
        }
        if (inv.id) {
            overrides[inv.id] = newStatus;
        }
        localStorage.setItem('analytics_status_overrides', JSON.stringify(overrides));
    } catch (e) {
        console.warn("Could not save status override to localStorage", e);
    }

    // Update caches
    localStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
    sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));

    // Instantly refresh dashboard metrics & charts
    updateKPICards();
    renderCharts();
    renderTable();

    const statusTitle = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    showToast(`Invoice ${inv.invoiceNo} marked as "${statusTitle}".`, "success", 3000);

    // Sync status change to Neon DB
    try {
        const apiBase = getApiBaseUrl();
        if (apiBase) {
            const updateKey = inv.backendId || inv.invoiceNo || inv.id;
            const res = await fetch(`${apiBase}/invoices/${encodeURIComponent(updateKey)}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.status === 404 && inv.raw) {
                // If invoice is not in DB yet, create it with this status
                await fetch(`${apiBase}/invoices`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        ...inv.raw,
                        status: newStatus
                    })
                });
            }
        }
    } catch (e) {
        console.warn("Backend status update note:", e);
    }
}

// Soft Delete Invoice Action
async function softDeleteInvoice(id) {
    const inv = parsedInvoices.find(i => i.id === id);
    if (!inv) return;

    const invoiceNo = inv.invoiceNo || 'this invoice';
    if (!confirm(`Are you sure you want to soft delete invoice "${invoiceNo}"?`)) {
        return;
    }

    // Attempt to soft delete in Neon DB backend if API is configured
    try {
        const apiBase = getApiBaseUrl();
        if (apiBase) {
            const deleteKey = inv.backendId || inv.invoiceNo || inv.id;
            const response = await fetch(`${apiBase}/invoices/${encodeURIComponent(deleteKey)}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const resJson = await response.json().catch(() => ({}));
                if (resJson.success) {
                    showToast(`🗑️ ${resJson.message || `Invoice ${invoiceNo} soft deleted from Neon DB.`}`, 'success', 3500);
                }
            }
        }
    } catch (err) {
        console.warn("Backend soft delete notification note:", err);
    }

    // Remove from in-memory records
    parsedInvoices = parsedInvoices.filter(i => i.id !== id);
    filteredInvoices = filteredInvoices.filter(i => i.id !== id);

    // Save updated state to sessionStorage
    sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));

    // Refresh KPIs, charts, and table
    populateFilterDropdowns();
    updateDashboard();
    showToast(`Invoice ${invoiceNo} removed from dashboard.`, 'info', 3000);
}

// Detail Modal
function openInvoiceModal(id) {
    const inv = parsedInvoices.find(i => i.id === id);
    if (!inv) return;

    const modal = document.getElementById('invoiceDetailModal');
    const title = document.getElementById('modalInvoiceTitle');
    const body = document.getElementById('modalInvoiceBody');

    title.innerText = `Invoice Details: ${inv.invoiceNo}`;

    let itemsHtml = '';
    if (inv.raw?.items && inv.raw.items.length > 0) {
        itemsHtml = inv.raw.items.map(it => `
            <tr>
                <td>${it.desc || '-'}</td>
                <td class="text-center">${it.qty || 1} Pax</td>
                <td class="text-end">${inv.symbol} ${parseFloat(it.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-end">${inv.symbol} ${(parseFloat(it.price || 0) * parseInt(it.qty || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join('');
    }

    body.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="p-3 bg-light rounded border">
                    <h6 class="fw-bold mb-2 text-primary"><i class="fa-solid fa-building"></i> Company & Customer</h6>
                    <div><strong>Company:</strong> ${inv.companyName}</div>
                    <div><strong>Customer:</strong> ${inv.customerName}</div>
                    <div><strong>Consultant:</strong> ${inv.tripConsultant}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="p-3 bg-light rounded border">
                    <h6 class="fw-bold mb-2 text-primary"><i class="fa-solid fa-calendar-days"></i> Booking & Schedule</h6>
                    <div><strong>Trip:</strong> ${inv.tripName}</div>
                    <div><strong>Travel Date:</strong> ${inv.tripDate || 'N/A'}</div>
                    <div><strong>Invoice Date:</strong> ${inv.invoiceDate} (Due: ${inv.dueDate})</div>
                </div>
            </div>
        </div>

        <h6 class="fw-bold mb-2">Itemized Breakdown</h6>
        <div class="table-responsive border rounded mb-3">
            <table class="table table-sm mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-end">Unit Price</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml || '<tr><td colspan="4" class="text-center py-2 text-muted">No items recorded</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="d-flex justify-content-between p-3 bg-light rounded border">
            <div>
                <div><strong>Status:</strong> <span class="text-uppercase fw-bold">${inv.status}</span></div>
                <div><strong>Currency:</strong> ${inv.currency}</div>
            </div>
            <div class="text-end">
                <div>Subtotal: <strong>${inv.symbol} ${inv.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                <div class="text-success">Deposit Paid: <strong>${inv.symbol} ${inv.depositPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                <div class="text-danger">Balance Due: <strong>${inv.symbol} ${inv.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeInvoiceModal() {
    document.getElementById('invoiceDetailModal')?.classList.remove('active');
}

// Seamless link into the Invoice Generator
function openInGenerator(id) {
    const inv = parsedInvoices.find(i => i.id === id);
    if (!inv || !inv.raw) return;

    localStorage.setItem('preload_draft_invoice', JSON.stringify(inv.raw));
    window.location.href = 'index.html?loadPreloaded=true';
}

// Clear all parsed invoices
function clearAllInvoices() {
    if (confirm("Are you sure you want to clear all parsed invoices from the dashboard?")) {
        parsedInvoices = [];
        filteredInvoices = [];
        localStorage.removeItem('analytics_invoices_cache');
        localStorage.removeItem('analytics_status_overrides');
        sessionStorage.removeItem('analytics_invoices_cache');
        updateDashboard();
        showToast("Dashboard cleared.", "info");
    }
}

// CSV Export
function exportAnalyticsCSV() {
    if (filteredInvoices.length === 0) {
        showToast("No invoices to export.", "warning");
        return;
    }

    const headers = ["Invoice No", "Date", "Due Date", "Company", "Customer", "Trip / Package", "Consultant", "Pax", "Currency", "Subtotal", "Deposit Paid", "Balance Due", "Status"];
    const rows = filteredInvoices.map(inv => [
        `"${inv.invoiceNo}"`,
        `"${inv.invoiceDate}"`,
        `"${inv.dueDate}"`,
        `"${inv.companyName.replace(/"/g, '""')}"`,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        `"${inv.tripName.replace(/"/g, '""')}"`,
        `"${inv.tripConsultant.replace(/"/g, '""')}"`,
        inv.pax,
        `"${inv.currency}"`,
        inv.subtotal.toFixed(2),
        inv.depositPaid.toFixed(2),
        inv.balanceDue.toFixed(2),
        `"${inv.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoice_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Sample Data Generator for Immediate Testing
function loadSampleInvoices() {
    const sampleTrips = [
        "Ho Chi Minh - Dalat - Mui Ne 5D4N",
        "Da Nang - Hoi An - Bana Hills 4D3N",
        "Hanoi - Halong Bay - Ninh Binh 5D4N",
        "Phu Quoc Island Getaway 4D3N",
        "Ho Chi Minh City Highlights 4D3N"
    ];

    const sampleConsultants = ["Nurul Huda", "Ahmad Zaki", "Siti Sarah", "Farhan Malik", "Lily Tran"];
    const sampleCompanies = ["SELAMATVN TOUR AND TRAVEL", "Lantera Travel", "Jom Travel", "Hararei Travel"];
    const sampleCustomers = [
        "Mega Travel Sdn Bhd", "Borneo Holiday Tours", "Global Explorer Agency",
        "Kembara Ummah Tours", "Datin Rozita & Family", "Pertama Vacations Ltd", "Far East Leisure Corp"
    ];

    const generated = [];
    const baseDate = new Date();

    for (let i = 1; i <= 15; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - (i * 3));
        const dateStr = d.toISOString().split('T')[0];

        const dueD = new Date(d);
        dueD.setDate(dueD.getDate() + 14);
        const dueDateStr = dueD.toISOString().split('T')[0];

        const pax = Math.floor(Math.random() * 12) + 2;
        const adultPrice = 1850;
        const total = pax * adultPrice;
        const depRatio = [1, 0.5, 0.3, 0][Math.floor(Math.random() * 4)];
        const deposit = Math.round(total * depRatio);

        const sampleRaw = {
            invoiceNo: `INV-${2026000 + i}`,
            invoiceDate: dateStr,
            dueDate: dueDateStr,
            currency: "RM",
            companyName: sampleCompanies[i % sampleCompanies.length],
            customerName: sampleCustomers[i % sampleCustomers.length],
            tripName: sampleTrips[i % sampleTrips.length],
            tripDate: `${dateStr} to ${dueDateStr}`,
            tripPax: pax,
            tripConsultant: sampleConsultants[i % sampleConsultants.length],
            depositPaid: deposit,
            grandTotal: total,
            packageIncludes: {
                meals: Math.random() > 0.3,
                transport: true,
                hotel: true,
                ticket: Math.random() > 0.4
            },
            items: [
                { desc: "ADULT PACKAGE (FULL INCLUSIVE)", qty: pax, price: adultPrice }
            ]
        };

        generated.push(normalizeInvoiceRecord(sampleRaw, `sample_invoice_${i}.pdf`));
    }

    parsedInvoices = generated;
    localStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
    sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
    populateFilterDropdowns();
    updateDashboard();
    showToast("Loaded 15 sample invoices for demonstration!", "success");
}

// SYNC INVOICES FROM LARAVEL + NEON CLOUD DATABASE
async function syncFromNeonCloud(options = {}) {
    const isAutoSync = options && options.isAutoSync === true;
    const apiBase = getApiBaseUrl();

    if (!apiBase) {
        if (!isAutoSync) {
            showToast("Running in Local Client Mode (Browser Storage). Invoices are saved locally.", "info", 5000);
        }
        return;
    }
    
    if (!isAutoSync) {
        showToast("Fetching invoices from Cloud Database...", "info", 2000);
    }

    try {
        const response = await fetch(`${apiBase}/invoices?per_page=-1`, {
            headers: { "Accept": "application/json" }
        });

        const result = await response.json();
        const invoiceList = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);

        if (response.ok && invoiceList.length >= 0) {
            if (invoiceList.length === 0) {
                if (!isAutoSync) {
                    showToast("Connected to database (0 invoices found)", "info", 4000);
                }
                return;
            }

            const cloudRecords = invoiceList.map(dbInv => {
                const invDate = (dbInv.invoice_date || '').split('T')[0] || new Date().toISOString().split('T')[0];
                const dueDate = (dbInv.due_date || '').split('T')[0] || invDate;
                const invStatus = (dbInv.status || 'unpaid').toLowerCase();

                const raw = dbInv.raw_draft ? {
                    ...dbInv.raw_draft,
                    backendId: dbInv.id,
                    invoiceNo: dbInv.invoice_no,
                    invoiceDate: invDate,
                    dueDate: dueDate,
                    status: invStatus
                } : {
                    backendId: dbInv.id,
                    invoiceNo: dbInv.invoice_no,
                    invoiceDate: invDate,
                    dueDate: dueDate,
                    status: invStatus,
                    currency: dbInv.currency || 'RM',
                    exchangeRate: parseFloat(dbInv.exchange_rate) || 1.0,
                    companyName: dbInv.company_name || 'SELAMATVN TOUR AND TRAVEL',
                    customerName: dbInv.customer_name || 'Client',
                    tripName: dbInv.trip_name || 'Tour',
                    tripDate: dbInv.trip_date || '',
                    tripPax: parseInt(dbInv.trip_pax) || 1,
                    tripConsultant: dbInv.trip_consultant || 'General Sales',
                    subtotal: parseFloat(dbInv.subtotal) || 0,
                    depositPaid: parseFloat(dbInv.deposit_paid) || 0,
                    grandTotal: parseFloat(dbInv.subtotal) || 0,
                    packageIncludes: dbInv.package_includes || {},
                    items: dbInv.items_data || [],
                    addons: dbInv.addons_data || []
                };
                return normalizeInvoiceRecord(raw, `neon_db_${dbInv.invoice_no}.db`);
            });

            parsedInvoices = cloudRecords;
            localStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
            sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
            populateFilterDropdowns();
            updateDashboard();

            if (isAutoSync) {
                showToast(`Auto-synced ${cloudRecords.length} live invoices from Neon DB`, "success", 3000);
            } else {
                showToast(`Synced ${cloudRecords.length} invoices from Cloud Database!`, "success", 4000);
            }
        } else if (!isAutoSync) {
            if (result.status === 'pending_configuration') {
                showToast("Backend is online, but Neon DB connection is pending in backend/.env", "warning", 6000);
            } else {
                showToast(`Could not fetch from Cloud DB: ${result.message || 'Unknown error'}`, "error", 5000);
            }
        }
    } catch (err) {
        if (!isAutoSync) {
            console.error("Sync error:", err);
            showToast(`Could not connect to API server at ${apiBase}.`, "error", 6000);
        } else {
            console.log("Auto-sync: API server not reachable on load.");
        }
    }
}

// UPLOAD ALL PARSED INVOICES TO LARAVEL + NEON CLOUD DATABASE OR LOCAL CACHE
async function uploadAllToNeonCloud() {
    if (parsedInvoices.length === 0) {
        showToast("No invoices to save. Drop PDF files or load sample data first.", "warning");
        return;
    }

    const apiBase = getApiBaseUrl();
    if (!apiBase) {
        localStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
        sessionStorage.setItem('analytics_invoices_cache', JSON.stringify(parsedInvoices));
        showToast(`Saved ${parsedInvoices.length} invoices locally in browser storage.`, "success", 4000);
        return;
    }

    showToast(`Uploading ${parsedInvoices.length} invoices to Cloud DB...`, "info", 3000);

    const payload = parsedInvoices.map(inv => inv.raw || {
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        companyName: inv.companyName,
        customerName: inv.customerName,
        tripName: inv.tripName,
        tripDate: inv.tripDate,
        tripPax: inv.pax,
        tripConsultant: inv.tripConsultant,
        currency: inv.currency,
        exchangeRate: inv.exchangeRate,
        subtotal: inv.subtotal,
        depositPaid: inv.depositPaid,
        grandTotal: inv.subtotal
    });

    try {
        const response = await fetch(`${apiBase}/invoices/bulk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ invoices: payload })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast(`✅ ${result.imported_count} invoices saved to Neon PostgreSQL Database!`, "success", 5000);
        } else if (result.status === 'pending_configuration') {
            showToast("⚠️ Backend is online, but Neon DB connection is pending in backend/.env", "warning", 6000);
        } else {
            showToast(`❌ Bulk upload error: ${result.message || 'Unknown error'}`, "error", 5000);
        }
    } catch (err) {
        console.error("Bulk upload error:", err);
        showToast(`Could not connect to API server at ${apiBase}.`, "error", 6000);
    }
}
