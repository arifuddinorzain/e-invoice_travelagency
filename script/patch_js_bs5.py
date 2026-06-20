import re

with open('assets/script.js', 'r') as f:
    js = f.read()

# Replace addRow function entirely
def repl_addrow(m):
    return """function addRow(tableId) {
    let row = `
    <div class="item-row card mb-3 shadow-sm border-0 bg-light">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label small fw-bold text-secondary text-uppercase mb-0">Item Description</label>
                <button type="button" onclick="removeRow(this)" class="btn btn-sm btn-link text-danger p-0 text-decoration-none" title="Remove Item"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <input type="text" class="desc form-control form-control-sm mb-3" placeholder="e.g. Flight Ticket" oninput="updateInvoice()">
            
            <div class="row g-2 align-items-end">
                <div class="col">
                    <label class="form-label small fw-bold text-secondary text-uppercase mb-1">Unit Price</label>
                    <input type="number" class="price form-control form-control-sm" value="0.00" min="0" step="0.01" oninput="updateInvoice()">
                </div>
                <div class="col-4">
                    <label class="form-label small fw-bold text-secondary text-uppercase mb-1">Qty</label>
                    <input type="number" class="qty form-control form-control-sm text-center" value="1" min="1" oninput="updateInvoice()">
                </div>
                <div class="col-auto text-end" style="min-width: 80px;">
                    <span class="d-block small fw-bold text-secondary text-uppercase mb-1">Total</span>
                    <span class="lineTotal fw-bold text-dark fs-6">0.00</span>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById(tableId).insertAdjacentHTML("beforeend", row);
    updateInvoice();
}"""

js = re.sub(r'function addRow\(tableId\) \{.*?\n\}', repl_addrow, js, flags=re.DOTALL)

# Replace addSocialRow function entirely
def repl_addsocial(m):
    return """function addSocialRow() {
    let row = `
    <div class="item-row card mb-2 shadow-sm border-0 bg-light">
        <div class="card-body p-2 d-flex gap-2 align-items-center">
            <div style="width: 35%;">
                <select class="socialPlatform form-select form-select-sm" onchange="updateInvoice()">
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="X">X (Twitter)</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="WhatsApp">WhatsApp</option>
                </select>
            </div>
            <div class="flex-grow-1">
                <input type="text" class="socialValue form-control form-control-sm" placeholder="@username or URL" oninput="updateInvoice()">
            </div>
            <button type="button" onclick="removeSocialRow(this)" class="btn btn-sm btn-link text-danger p-1 text-decoration-none" title="Remove Social Media"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    </div>
    `;
    document.getElementById("socialItems").insertAdjacentHTML("beforeend", row);
    updateInvoice();
}"""

js = re.sub(r'function addSocialRow\(\) \{.*?\n\}', repl_addsocial, js, flags=re.DOTALL)

with open('assets/script.js', 'w') as f:
    f.write(js)
