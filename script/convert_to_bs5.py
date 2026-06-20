import re

with open('index.html', 'r') as f:
    html = f.read()

# Remove Tailwind CDN and config
html = re.sub(r'<script src="https://cdn\.tailwindcss\.com"></script>\s*<script>\s*tailwind\.config = \{.*?\};\s*</script>', '', html, flags=re.DOTALL)

# Add Bootstrap 5 CSS
bs5_link = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">'
if bs5_link not in html:
    html = html.replace('<link rel="stylesheet" href="assets/style.css">', f'{bs5_link}\n    <link rel="stylesheet" href="assets/style.css">')

# Replace form section wrapper
html = re.sub(r'class="form-section[^"]*"', 'class="form-section bg-white p-4 shadow-sm rounded border"', html)

# Replace Labels
html = re.sub(r'<label class="block text-sm font-semibold text-gray-700 mt-4 mb-1">', '<label class="form-label small fw-bold text-secondary mt-3 mb-1">', html)

# Replace Inputs (text, date, number)
html = re.sub(r'<input type="(text|date|number)" ([^>]+) class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-gray-50 hover:bg-white">', r'<input type="\1" \2 class="form-control form-control-sm">', html)
# Fallback for remaining inputs with other tailwind classes
html = re.sub(r'class="w-full border border-gray-300 rounded-lg p-2\.5 text-sm[^"]*"', 'class="form-control form-control-sm"', html)

# Replace Textarea
html = re.sub(r'<textarea id="([^"]+)"([^>]*) class="form-control form-control-sm" rows="3">', r'<textarea id="\1"\2 class="form-control form-control-sm" rows="3">', html)

# Replace Select
html = re.sub(r'<select id="([^"]+)"([^>]*) class="form-control form-control-sm">', r'<select id="\1"\2 class="form-select form-select-sm">', html)

# Replace File Input
html = re.sub(r'class="w-full text-sm text-gray-500 file:[^"]*"', 'class="form-control form-control-sm mt-1"', html)

# Replace Buttons
html = re.sub(r'class="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg transition text-sm flex justify-center items-center gap-2"', 'class="btn btn-light btn-sm w-100 mt-2 mb-3 border fw-bold d-flex justify-content-center align-items-center gap-2"', html)
html = re.sub(r'class="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg transition text-sm flex justify-center items-center gap-2"', 'class="btn btn-light btn-sm w-100 mt-2 mb-3 border fw-bold d-flex justify-content-center align-items-center gap-2"', html)

# Download PDF button
html = re.sub(r'class="w-full bg-\[#EF6C00\] hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex justify-center items-center gap-2 mt-4"', 'class="btn btn-warning w-100 mt-4 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #EF6C00; color: white; border: none;"', html)

# Headings
html = re.sub(r'<h2 class="text-lg font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">', '<h4 class="mt-4 mb-3 border-bottom pb-2 d-flex align-items-center gap-2 fw-bold text-dark">', html)
html = html.replace('</h2>', '</h4>') # Needs careful replacement if I just changed opening tag, but since they match, it's fine. Wait, the regex replaced the opening tag to h4.
# Let's fix closing tags for h2 that were transformed.
html = re.sub(r'<h4(.*?)</h2>', r'<h4\1</h4>', html)

html = re.sub(r'<h3 class="text-md font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2">', '<h5 class="mt-4 mb-3 d-flex align-items-center gap-2 fw-bold text-dark">', html)
html = re.sub(r'<h5(.*?)</h3>', r'<h5\1</h5>', html)

with open('index.html', 'w') as f:
    f.write(html)
