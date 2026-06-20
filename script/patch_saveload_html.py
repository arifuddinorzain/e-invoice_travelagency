with open('index.html', 'r') as f:
    html = f.read()

buttons_html = """        <h4 class="mt-4 mb-3 border-bottom pb-2 d-flex align-items-center gap-2 fw-bold text-dark"><i class="fa-solid fa-layer-group text-orange-500"></i> Settings</h4>
        <div class="d-flex gap-2 mb-3">
            <button type="button" class="btn btn-primary btn-sm flex-fill fw-bold" onclick="saveInvoice()"><i class="fa-solid fa-download"></i> Save (.inv)</button>
            <button type="button" class="btn btn-secondary btn-sm flex-fill fw-bold" onclick="document.getElementById('loadInvoiceFile').click()"><i class="fa-solid fa-upload"></i> Load (.inv)</button>
            <input type="file" id="loadInvoiceFile" style="display:none" accept=".inv" onchange="loadInvoice(event)">
        </div>"""

html = html.replace('<h4 class="mt-4 mb-3 border-bottom pb-2 d-flex align-items-center gap-2 fw-bold text-dark"><i class="fa-solid fa-layer-group text-orange-500"></i> Settings</h4>', buttons_html)

with open('index.html', 'w') as f:
    f.write(html)
