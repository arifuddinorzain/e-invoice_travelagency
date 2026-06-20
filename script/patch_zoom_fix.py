import re

with open('assets/script.js', 'r') as f:
    js = f.read()

new_download_pdf = """function downloadPDF(){
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
}"""

js = re.sub(r'function downloadPDF\(\).*?(?=\n// Init|\nfunction |\Z)', new_download_pdf + "\n", js, flags=re.DOTALL)

with open('assets/script.js', 'w') as f:
    f.write(js)
