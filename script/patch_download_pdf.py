import re

with open('assets/script.js', 'r') as f:
    js = f.read()

new_download_pdf = """function downloadPDF(){
    updateInvoice();
    const invoice = document.getElementById("invoiceToDownload");
    const previewScaleWrapper = document.querySelector(".preview-scale");

    if (previewScaleWrapper) previewScaleWrapper.classList.remove("preview-scale");

    // Force exact pixel dimensions to prevent browser zoom from cropping the PDF
    const originalWidth = invoice.style.width;
    const originalMaxWidth = invoice.style.maxWidth;
    invoice.style.width = '794px';
    invoice.style.maxWidth = '794px';

    html2pdf().set({
        margin: 0,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(invoice).save().then(() => {
        // Restore original styles
        invoice.style.width = originalWidth;
        invoice.style.maxWidth = originalMaxWidth;
        if (previewScaleWrapper) previewScaleWrapper.classList.add("preview-scale");
    });
}"""

js = re.sub(r'function downloadPDF\(\)\{.*?(?=\n// Init|\nfunction |\Z)', new_download_pdf + "\n", js, flags=re.DOTALL)

with open('assets/script.js', 'w') as f:
    f.write(js)
