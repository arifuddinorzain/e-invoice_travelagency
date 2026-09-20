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
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function updateInvoice() {
    let currency = document.getElementById("currency").value;
    document.querySelectorAll(".p_currency_lbl").forEach(el => el.innerText = currency);

    // 1. Update Company & Header
    let cName = (document.getElementById("companyName")?.value || "").trim();
    let cAddr = (document.getElementById("companyAddress")?.value || "").trim();
    let fullAddr = [cName, cAddr.replace(/\n/g, ', ')].filter(Boolean).join(' - ');
    let pAddressItem = document.getElementById("p_item_cAddress");
    if (pAddressItem) {
        document.getElementById("p_cNameAddress").innerText = fullAddr;
        pAddressItem.style.display = fullAddr ? "flex" : "none";
    }

    let phoneVal = (document.getElementById("companyPhone")?.value || "").trim();
    let pPhoneItem = document.getElementById("p_item_cPhone");
    if (pPhoneItem) {
        document.getElementById("p_cPhone").innerText = phoneVal;
        pPhoneItem.style.display = phoneVal ? "flex" : "none";
    }

    let emailVal = (document.getElementById("companyEmail")?.value || "").trim();
    let showEmail = document.getElementById("showCompanyEmail") ? document.getElementById("showCompanyEmail").checked : false;
    let pEmailItem = document.getElementById("p_item_cEmail");
    if (pEmailItem) {
        document.getElementById("p_cEmail").innerText = emailVal;
        pEmailItem.style.display = (showEmail && emailVal !== "") ? "flex" : "none";
    }

    let webVal = (document.getElementById("companyWebsite")?.value || "").trim();
    let showWeb = document.getElementById("showCompanyWebsite") ? document.getElementById("showCompanyWebsite").checked : false;
    let pWebItem = document.getElementById("p_item_cWeb");
    if (pWebItem) {
        document.getElementById("p_cWeb").innerText = webVal;
        pWebItem.style.display = (showWeb && webVal !== "") ? "flex" : "none";
    }

    // Social Media
    let socialHtml = "";
    document.querySelectorAll("#socialItems .item-row").forEach(row => {
        let platform = row.querySelector(".socialPlatform").value;
        let value = row.querySelector(".socialValue").value;
        if (value.trim() !== "") {
            let icon = "";
            switch (platform) {
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
    if (socialContainer) socialContainer.innerHTML = socialHtml;


    document.getElementById("p_invNo").innerText = document.getElementById("invoiceNo").value;
    document.getElementById("p_invDate").innerText = formatDate(document.getElementById("invoiceDate").value);
    document.getElementById("p_invDue").innerText = formatDate(document.getElementById("dueDate").value);

    // 2. Bill To & Trip Details
    document.getElementById("p_custName").innerText = document.getElementById("customerName").value;
    document.getElementById("p_custAddr").innerText = document.getElementById("customerAddress").value;

    let custSocVal = (document.getElementById("customerSocial")?.value || "").trim();
    let showCustSoc = document.getElementById("showCustomerSocial") ? document.getElementById("showCustomerSocial").checked : false;
    let pCustSocItem = document.getElementById("p_item_custSoc");
    if (pCustSocItem) {
        document.getElementById("p_custSoc").innerText = custSocVal;
        pCustSocItem.style.display = (showCustSoc && custSocVal !== "") ? "block" : "none";
    }

    document.getElementById("p_tripName").innerText = document.getElementById("tripName").value;
    document.getElementById("p_tripDate").innerText = formatDate(document.getElementById("tripDate").value);
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

    // 6. Approved By Signature
    let sigName = (document.getElementById("approvedByName")?.value || "").trim();
    let pSigNameBottom = document.getElementById("p_sigNameBottom");
    if (pSigNameBottom) {
        pSigNameBottom.innerText = sigName ? sigName : "";
    }
}

/* Listeners */
document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', updateInvoice);
    el.addEventListener('change', updateInvoice);
});

// Logo
const logoUpload = document.getElementById("logoUpload");
if (logoUpload) {
    logoUpload.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const logo = document.getElementById("previewLogo");
            logo.src = event.target.result;
            logo.style.display = "block";
        };
        reader.readAsDataURL(file);
    });
}

function removeLogo() {
    const input = document.getElementById("logoUpload");
    if (input) input.value = "";
    const logo = document.getElementById("previewLogo");
    if (logo) {
        logo.src = "";
        logo.style.display = "none";
    }
}

// Signature Upload
const signatureUpload = document.getElementById("signatureUpload");
if (signatureUpload) {
    signatureUpload.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const sig = document.getElementById("previewSignature");
            if (sig) {
                sig.src = event.target.result;
                sig.style.display = "block";
            }
        };
        reader.readAsDataURL(file);
    });
}

function removeSignature() {
    const input = document.getElementById("signatureUpload");
    if (input) input.value = "";
    const sig = document.getElementById("previewSignature");
    if (sig) {
        sig.src = "";
        sig.style.display = "none";
    }
}

function downloadPDF() {
    updateInvoice();
    const invoice = document.getElementById("invoiceToDownload");
    const invNumber = document.getElementById("invoiceNo")?.value.trim() || "invoice";

    const opt = {
        margin: 0,
        filename: `${invNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            onclone: function (clonedDoc) {
                // Remove the CSS scale completely on the cloned document
                const scaleWrapper = clonedDoc.querySelector('.preview-scale');
                if (scaleWrapper) {
                    scaleWrapper.classList.remove('preview-scale');
                    scaleWrapper.style.transform = 'none';
                }

                // Force exact dimensions on invoice
                const clonedInvoice = clonedDoc.getElementById('invoiceToDownload');
                if (clonedInvoice) {
                    clonedInvoice.style.width = '794px';
                    clonedInvoice.style.maxWidth = '794px';
                    clonedInvoice.style.minHeight = 'auto';
                    clonedInvoice.style.height = 'auto';
                    clonedInvoice.style.margin = '0';
                    clonedInvoice.style.padding = '0';
                    clonedInvoice.style.boxShadow = 'none';
                    clonedInvoice.style.border = 'none';
                }

                // Ensure body/html have no extra spacing
                clonedDoc.body.style.margin = '0';
                clonedDoc.body.style.padding = '0';
                clonedDoc.documentElement.style.margin = '0';
                clonedDoc.documentElement.style.padding = '0';
                clonedDoc.documentElement.style.fontSize = '16px';
            }
        },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.invoice-bottom-block', '.summary-area', '.footer-signature-area'] },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(invoice).save();
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
        approvedByName: document.getElementById("approvedByName") ? document.getElementById("approvedByName").value : "",
        showCompanyEmail: document.getElementById("showCompanyEmail") ? document.getElementById("showCompanyEmail").checked : false,
        showCompanyWebsite: document.getElementById("showCompanyWebsite") ? document.getElementById("showCompanyWebsite").checked : false,
        showCustomerSocial: document.getElementById("showCustomerSocial") ? document.getElementById("showCustomerSocial").checked : false,
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

    let custName = (data.customerName || "").trim();
    let travelDate = (data.tripDate || "").trim();
    let filename = "";

    if (custName && travelDate) {
        filename = `${custName}_${travelDate}`;
    } else if (custName) {
        filename = custName;
    } else if (travelDate) {
        filename = `invoice_${travelDate}`;
    } else {
        let dateStr = new Date().toISOString().slice(0, 10);
        filename = `invoice_${dateStr}`;
    }

    // Sanitize any invalid filename characters
    filename = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();

    a.href = url;
    a.download = `${filename}.inv`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadInvoice(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        try {
            let data = JSON.parse(e.target.result);

            let fields = ["currency", "companyName", "companyAddress", "companyPhone", "companyEmail", "companyWebsite", "invoiceNo", "invoiceDate", "dueDate", "customerName", "customerAddress", "customerSocial", "tripName", "tripDate", "tripPax", "tripConsultant", "groupSize", "paymentTerms", "paymentMode", "depositPaid", "tax", "approvedByName"];

            fields.forEach(id => {
                if (data[id] !== undefined && document.getElementById(id)) {
                    document.getElementById(id).value = data[id];
                }
            });

            if (document.getElementById("showCompanyEmail")) {
                document.getElementById("showCompanyEmail").checked = data.showCompanyEmail !== undefined ? data.showCompanyEmail : false;
            }
            if (document.getElementById("showCompanyWebsite")) {
                document.getElementById("showCompanyWebsite").checked = data.showCompanyWebsite !== undefined ? data.showCompanyWebsite : false;
            }
            if (document.getElementById("showCustomerSocial")) {
                document.getElementById("showCustomerSocial").checked = data.showCustomerSocial !== undefined ? data.showCustomerSocial : false;
            }

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

function toggleAllAccordion(expand) {
    document.querySelectorAll('#formAccordion .accordion-collapse').forEach(el => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
            if (expand) {
                bsCollapse.show();
            } else {
                bsCollapse.hide();
            }
        } else {
            if (expand) {
                el.classList.add('show');
            } else {
                el.classList.remove('show');
            }
        }
    });
}

