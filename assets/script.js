let rowCount = 1;

function addRow(tableId) {
    let row = `
    <tr>
        <td>
            <input type="text" class="desc" placeholder="Item description" oninput="updateInvoice()">
        </td>
        <td>
            <input type="number" class="price" value="0" min="0" step="0.01" oninput="updateInvoice()">
        </td>
        <td>
            <input type="number" class="qty" value="1" min="1" oninput="updateInvoice()">
        </td>
        <td class="lineTotal">0.00</td>
        <td>
            <button type="button" onclick="removeRow(this)">X</button>
        </td>
    </tr>
    `;
    document.getElementById(tableId).insertAdjacentHTML("beforeend", row);
    updateInvoice();
}

function removeRow(btn) {
    btn.closest("tr").remove();
    updateInvoice();
}

function updateInvoice() {
    // 1. Update Company & Header
    document.getElementById("p_cNameAddress").innerText = document.getElementById("companyName").value + " - " + document.getElementById("companyAddress").value.replace(/\n/g, ', ');
    document.getElementById("p_cPhone").innerText = document.getElementById("companyPhone").value;
    document.getElementById("p_cEmail").innerText = document.getElementById("companyEmail").value;
    document.getElementById("p_cWeb").innerText = document.getElementById("companyWebsite").value;
    document.getElementById("p_cFb").innerText = document.getElementById("companyFb").value;

    document.getElementById("p_invNo").innerText = document.getElementById("invoiceNo").value;
    document.getElementById("p_invDate").innerText = document.getElementById("invoiceDate").value || '-';
    document.getElementById("p_invDue").innerText = document.getElementById("dueDate").value || '-';

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
    document.getElementById("m_due").innerText = document.getElementById("dueDate").value || '-'; // Sync

    // 4. Calculate Items & Build Table
    let pkgRows = document.querySelectorAll("#invoiceItems tr");
    let addonRows = document.querySelectorAll("#addonItems tr");
    
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

    document.getElementById("s_pkgTot").innerText = "RM " + subtotal.toFixed(2);
    document.getElementById("s_dep").innerText = "RM " + deposit.toFixed(2);
    document.getElementById("s_bal").innerText = "RM " + balance.toFixed(2);
    
    document.getElementById("s_sub").innerText = "RM " + subtotal.toFixed(2);
    document.getElementById("s_taxPct").innerText = taxPct;
    document.getElementById("s_taxVal").innerText = "RM " + taxVal.toFixed(2);
    document.getElementById("s_grand").innerText = "RM " + grand.toFixed(2);
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
    const invoice = document.getElementById("preview-section");
    const previewScaleWrapper = document.querySelector(".preview-scale");

    if (previewScaleWrapper) previewScaleWrapper.classList.remove("preview-scale");

    html2pdf().set({
        margin: 0,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(invoice).save().then(() => {
        if (previewScaleWrapper) previewScaleWrapper.classList.add("preview-scale");
    });
}

// Init
addRow('invoiceItems');
updateInvoice();