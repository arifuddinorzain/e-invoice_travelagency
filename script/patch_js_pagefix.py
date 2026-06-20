import re

with open('assets/script.js', 'r') as f:
    js = f.read()

# Replace the specific lines inside onclone
old_onclone = """                clonedInvoice.style.width = '794px';
                clonedInvoice.style.maxWidth = '794px';
                clonedInvoice.style.minHeight = '1123px'; // A4 height
                clonedInvoice.style.margin = '0';
                clonedInvoice.style.padding = '0';"""

new_onclone = """                clonedInvoice.style.width = '794px';
                clonedInvoice.style.maxWidth = '794px';
                clonedInvoice.style.minHeight = 'auto'; // Let content dictate height to prevent blank page spill
                clonedInvoice.style.height = 'auto';
                clonedInvoice.style.margin = '0';
                clonedInvoice.style.padding = '0';
                clonedInvoice.style.boxShadow = 'none'; // Remove shadow to prevent bleed
                clonedInvoice.style.border = 'none';"""

js = js.replace(old_onclone, new_onclone)

with open('assets/script.js', 'w') as f:
    f.write(js)
