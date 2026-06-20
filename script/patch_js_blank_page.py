import re

with open('assets/script.js', 'r') as f:
    js = f.read()

old_onclone = """                clonedInvoice.style.margin = '0';
                clonedInvoice.style.padding = '0';
                clonedInvoice.style.boxShadow = 'none'; // Remove shadow to prevent bleed
                clonedInvoice.style.border = 'none';
                
                // Set explicit font size root if zoom affected it
                clonedDoc.documentElement.style.fontSize = '16px';
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }"""

new_onclone = """                clonedInvoice.style.margin = '0';
                clonedInvoice.style.padding = '0';
                clonedInvoice.style.boxShadow = 'none'; // Remove shadow to prevent bleed
                clonedInvoice.style.border = 'none';
                clonedInvoice.style.overflow = 'hidden';
                
                // Ensure body/html have no extra space causing blank pages
                clonedDoc.body.style.margin = '0';
                clonedDoc.body.style.padding = '0';
                clonedDoc.documentElement.style.margin = '0';
                clonedDoc.documentElement.style.padding = '0';
                clonedDoc.documentElement.style.fontSize = '16px';
            }
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }"""

js = js.replace(old_onclone, new_onclone)

with open('assets/script.js', 'w') as f:
    f.write(js)
