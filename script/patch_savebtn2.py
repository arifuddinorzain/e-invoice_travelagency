import re

with open('index.html', 'r') as f:
    html = f.read()

# Using regex to find the button regardless of line breaks
pattern = r'(<button[^>]*onclick="downloadPDF\(\)"[^>]*>.*?Download PDF</button>)'

replacement = r'''<button type="button" class="btn btn-primary w-100 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3" onclick="saveInvoice()"><i class="fa-solid fa-download"></i> Save Draft (.inv)</button>
            \1'''

html = re.sub(pattern, replacement, html, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(html)
