with open('index.html', 'r') as f:
    html = f.read()

download_btn = '<button onclick="downloadPDF()" class="btn btn-warning w-100 mt-4 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #EF6C00; color: white; border: none;"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>'

save_btn_bottom = '<button type="button" class="btn btn-primary w-100 mt-4 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center gap-2" onclick="saveInvoice()"><i class="fa-solid fa-download"></i> Save Draft (.inv)</button>\n        <button onclick="downloadPDF()" class="btn btn-warning w-100 mt-3 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #EF6C00; color: white; border: none;"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>'

html = html.replace(download_btn, save_btn_bottom)

with open('index.html', 'w') as f:
    f.write(html)
