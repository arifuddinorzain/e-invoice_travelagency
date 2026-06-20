let rowCount = 1;

function addRow(tableId) {
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
}

function removeRow(btn) {
    btn.closest(".item-row").remove();
    updateInvoice();
}


function addSocialRow() {
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
}

function removeSocialRow(btn) {
    btn.closest(".item-row").remove();
    updateInvoice();
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function updateInvoice() {
    let currency = document.getElementById("currency").value;
    document.querySelectorAll(".p_currency_lbl").forEach(el => el.innerText = currency);

    // 1. Update Company & Header
    document.getElementById("p_cNameAddress").innerText = document.getElementById("companyName").value + " - " + document.getElementById("companyAddress").value.replace(/\n/g, ', ');
    document.getElementById("p_cPhone").innerText = document.getElementById("companyPhone").value;
    document.getElementById("p_cEmail").innerText = document.getElementById("companyEmail").value;
    document.getElementById("p_cWeb").innerText = document.getElementById("companyWebsite").value;
    
    // Social Media
    let socialHtml = "";
    document.querySelectorAll("#socialItems .item-row").forEach(row => {
        let platform = row.querySelector(".socialPlatform").value;
        let value = row.querySelector(".socialValue").value;
        if(value.trim() !== "") {
            let icon = "";
            switch(platform){
                case "Facebook": icon = "fa-brands fa-facebook"; break;
                case "Instagram": icon = "fa-brands fa-instagram"; break;
                case "TikTok": icon = "fa-brands fa-tiktok"; break;
                case "X": icon = "fa-brands fa-x-twitter"; break;
                case "LinkedIn": icon = "fa-brands fa-linkedin"; break;
                case "YouTube": icon = "fa-brands fa-youtube"; break;
                case "WhatsApp": icon = "fa-brands fa-whatsapp"; break;
            }
            socialHtml += `<div class="contact-item"><i class="${icon}"></i> <span>${value}</span></div>`;
        }
    });
    let socialContainer = document.getElementById("previewCompanySocials");
    if(socialContainer) socialContainer.innerHTML = socialHtml;


    document.getElementById("p_invNo").innerText = document.getElementById("invoiceNo").value;
    document.getElementById("p_invDate").innerText = formatDate(document.getElementById("invoiceDate").value);
    document.getElementById("p_invDue").innerText = formatDate(document.getElementById("dueDate").value);

    // 2. Bill To & Trip Details
    document.getElementById("p_custName").innerText = document.getElementById("customerName").value;
    document.getElementById("p_custAddr").innerText = document.getElementById("customerAddress").value;
    document.getElementById("p_custSoc").innerText = document.getElementById("customerSocial").value;

    document.getElementById("p_tripName").innerText = document.getElementById("tripName").value;
    document.getElementById("p_tripDate").innerText = document.getElementById("tripDate").value;
    document.getElementById("p_tripPax").innerText = document.getElementById("tripPax").value;
    document.getElementById("p_tripCons").innerText = document.getElementById("tripConsultant").value;

    // 3. Meta Info
    document.getElementById("m_agent").innerText = document.getElementById("tripConsultant").value; // Sync
    document.getElementById("m_size").innerText = document.getElementById("groupSize").value;
    document.getElementById("m_terms").innerText = document.getElementById("paymentTerms").value;
    document.getElementById("m_mode").innerText = document.getElementById("paymentMode").value;
    document.getElementById("m_due").innerText = formatDate(document.getElementById("dueDate").value); // Sync

    // 4. Calculate Items & Build Table
    let pkgRows = document.querySelectorAll("#invoiceItems .item-row");
    let addonRows = document.querySelectorAll("#addonItems .item-row");
    
    let subtotal = 0;
    let html = "";
    let idx = 1;

    // Packages
    if (pkgRows.length > 0) {
        html += `<tr class="cat-row"><td colspan="5"><i class="fa-solid fa-suitcase"></i> PACKAGE</td></tr>`;
        pkgRows.forEach(row => {
            let desc = row.querySelector(".desc").value;
            let price = parseFloat(row.querySelector(".price").value) || 0;
            let qty = parseInt(row.querySelector(".qty").value) || 0;
            let total = price * qty;
            subtotal += total;
            row.querySelector(".lineTotal").innerText = total.toFixed(2);
            
            html += `<tr><td>${idx++}</td><td>${desc}</td><td>${qty} Pax</td><td>${price.toFixed(2)}</td><td>${total.toFixed(2)}</td></tr>`;
        });
    }

    // Addons
    if (addonRows.length > 0) {
        html += `<tr class="cat-row"><td colspan="5"><i class="fa-solid fa-bag-shopping"></i> ADD-ON / SERVICE</td></tr>`;
        addonRows.forEach(row => {
            let desc = row.querySelector(".desc").value;
            let price = parseFloat(row.querySelector(".price").value) || 0;
            let qty = parseInt(row.querySelector(".qty").value) || 0;
            let total = price * qty;
            subtotal += total;
            row.querySelector(".lineTotal").innerText = total.toFixed(2);
            
            html += `<tr><td>${idx++}</td><td>${desc}</td><td>${qty} Pax</td><td>${price.toFixed(2)}</td><td>${total.toFixed(2)}</td></tr>`;
        });
    }

    if (html === "") {
        html = `<tr><td colspan="5">No services added</td></tr>`;
    }
    
    document.getElementById("p_items").innerHTML = html;

    // 5. Totals & Payment Summary
    let taxPct = parseFloat(document.getElementById("tax").value) || 0;
    let taxVal = subtotal * (taxPct / 100);
    let grand = subtotal + taxVal;
    let deposit = parseFloat(document.getElementById("depositPaid").value) || 0;
    let balance = grand - deposit;

    document.getElementById("s_pkgTot").innerText = currency + " " + subtotal.toFixed(2);
    document.getElementById("s_dep").innerText = currency + " " + deposit.toFixed(2);
    document.getElementById("s_bal").innerText = currency + " " + balance.toFixed(2);
    
    document.getElementById("s_sub").innerText = currency + " " + subtotal.toFixed(2);
    document.getElementById("s_taxPct").innerText = taxPct;
    document.getElementById("s_taxVal").innerText = currency + " " + taxVal.toFixed(2);
    document.getElementById("s_grand").innerText = currency + " " + grand.toFixed(2);
}

/* Listeners */
document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', updateInvoice);
});

// Logo
const logoUpload = document.getElementById("logoUpload");
if (logoUpload) {
    logoUpload.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const logo = document.getElementById("previewLogo");
            logo.src = event.target.result;
            logo.style.display = "block";
        };
        reader.readAsDataURL(file);
    });
}

function downloadPDF(){
    updateInvoice();
    const invoice = document.getElementById("invoiceToDownload");

    html2pdf().set({
        margin: 0,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            onclone: function(clonedDoc) {
                // Remove the CSS scale completely on the cloned document
                const scaleWrapper = clonedDoc.querySelector('.preview-scale');
                if (scaleWrapper) {
                    scaleWrapper.classList.remove('preview-scale');
                    scaleWrapper.style.transform = 'none';
                }
                
                // Force the exact A4 pixel dimensions on the invoice wrapper
                const clonedInvoice = clonedDoc.getElementById('invoiceToDownload');
                clonedInvoice.style.width = '794px';
                clonedInvoice.style.maxWidth = '794px';
                clonedInvoice.style.minHeight = '1123px'; // A4 height
                clonedInvoice.style.margin = '0';
                clonedInvoice.style.padding = '0';
                
                // Set explicit font size root if zoom affected it
                clonedDoc.documentElement.style.fontSize = '16px';
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(invoice).save();
}

// Init
addRow('invoiceItems');
addSocialRow();
updateInvoice();
// SAVE & LOAD INVOICE DATA
function saveInvoice() {
    let data = {
        currency: document.getElementById("currency").value,
        companyName: document.getElementById("companyName").value,
        companyAddress: document.getElementById("companyAddress").value,
        companyPhone: document.getElementById("companyPhone").value,
        companyEmail: document.getElementById("companyEmail").value,
        companyWebsite: document.getElementById("companyWebsite").value,
        invoiceNo: document.getElementById("invoiceNo").value,
        invoiceDate: document.getElementById("invoiceDate").value,
        dueDate: document.getElementById("dueDate").value,
        customerName: document.getElementById("customerName").value,
        customerAddress: document.getElementById("customerAddress").value,
        customerSocial: document.getElementById("customerSocial").value,
        tripName: document.getElementById("tripName").value,
        tripDate: document.getElementById("tripDate").value,
        tripPax: document.getElementById("tripPax").value,
        tripConsultant: document.getElementById("tripConsultant").value,
        groupSize: document.getElementById("groupSize").value,
        paymentTerms: document.getElementById("paymentTerms").value,
        paymentMode: document.getElementById("paymentMode").value,
        depositPaid: document.getElementById("depositPaid").value,
        tax: document.getElementById("tax").value,
        social: [],
        items: [],
        addons: []
    };

    document.querySelectorAll("#socialItems .item-row").forEach(row => {
        data.social.push({
            platform: row.querySelector(".socialPlatform").value,
            value: row.querySelector(".socialValue").value
        });
    });

    document.querySelectorAll("#invoiceItems .item-row").forEach(row => {
        data.items.push({
            desc: row.querySelector(".desc").value,
            price: row.querySelector(".price").value,
            qty: row.querySelector(".qty").value
        });
    });

    document.querySelectorAll("#addonItems .item-row").forEach(row => {
        data.addons.push({
            desc: row.querySelector(".desc").value,
            price: row.querySelector(".price").value,
            qty: row.querySelector(".qty").value
        });
    });

    let json = JSON.stringify(data, null, 2);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    
    let dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    a.href = url;
    a.download = `invoice_${dateStr}.inv`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadInvoice(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);
            
            let fields = ["currency", "companyName", "companyAddress", "companyPhone", "companyEmail", "companyWebsite", "invoiceNo", "invoiceDate", "dueDate", "customerName", "customerAddress", "customerSocial", "tripName", "tripDate", "tripPax", "tripConsultant", "groupSize", "paymentTerms", "paymentMode", "depositPaid", "tax"];
            
            fields.forEach(id => {
                if(data[id] !== undefined && document.getElementById(id)) {
                    document.getElementById(id).value = data[id];
                }
            });

            document.getElementById("socialItems").innerHTML = "";
            document.getElementById("invoiceItems").innerHTML = "";
            document.getElementById("addonItems").innerHTML = "";

            if (data.social && data.social.length > 0) {
                data.social.forEach(item => {
                    addSocialRow();
                    let rows = document.querySelectorAll("#socialItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".socialPlatform").value = item.platform;
                    lastRow.querySelector(".socialValue").value = item.value;
                });
            }

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    addRow('invoiceItems');
                    let rows = document.querySelectorAll("#invoiceItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".desc").value = item.desc;
                    lastRow.querySelector(".price").value = item.price;
                    lastRow.querySelector(".qty").value = item.qty;
                });
            }

            if (data.addons && data.addons.length > 0) {
                data.addons.forEach(item => {
                    addRow('addonItems');
                    let rows = document.querySelectorAll("#addonItems .item-row");
                    let lastRow = rows[rows.length - 1];
                    lastRow.querySelector(".desc").value = item.desc;
                    lastRow.querySelector(".price").value = item.price;
                    lastRow.querySelector(".qty").value = item.qty;
                });
            }

            updateInvoice();
            event.target.value = ""; 
        } catch (err) {
            alert("Ralat: Fail tidak sah atau rosak.");
            console.error(err);
        }
    };
    reader.readAsText(file);
}
