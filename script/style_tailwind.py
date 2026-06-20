import re

with open('index.html', 'r') as f:
    html = f.read()

# Add Tailwind CDN
if 'cdn.tailwindcss.com' not in html:
    html = html.replace('</head>', """    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        corePlugins: { preflight: false },
        theme: { extend: {} }
      }
    </script>
</head>""")

# Replace Form classes
# 1. Labels
html = re.sub(r'<label>', r'<label class="block text-sm font-semibold text-gray-700 mt-4 mb-1">', html)
# 2. Inputs (text, date, number)
html = re.sub(r'<input type="(text|date|number)" ([^>]+)>', r'<input type="\1" \2 class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-gray-50 hover:bg-white">', html)
# 3. Textarea
html = re.sub(r'<textarea id="([^"]+)"([^>]*)>', r'<textarea id="\1"\2 class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-gray-50 hover:bg-white" rows="3">', html)
# 4. Select
html = re.sub(r'<select id="([^"]+)"([^>]*)>', r'<select id="\1"\2 class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-gray-50 hover:bg-white">', html)
# 5. File input
html = re.sub(r'<input type="file"([^>]+)>', r'<input type="file"\1 class="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 mt-1 cursor-pointer">', html)
# 6. Buttons
html = re.sub(r'<button type="button" onclick="addRow\(([^)]+)\)">([^<]+)</button>', r'<button type="button" onclick="addRow(\1)" class="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg transition text-sm flex justify-center items-center gap-2">\2</button>', html)
html = re.sub(r'<button type="button" onclick="addSocialRow\(\)">([^<]+)</button>', r'<button type="button" onclick="addSocialRow()" class="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg transition text-sm flex justify-center items-center gap-2">\1</button>', html)
html = re.sub(r'<button onclick="downloadPDF\(\)" style="[^"]*">([^<]+)</button>', r'<button onclick="downloadPDF()" class="w-full bg-[#EF6C00] hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex justify-center items-center gap-2 mt-4"><i class="fa-solid fa-file-pdf"></i> \1</button>', html)
# 7. Headings
html = re.sub(r'<h2>([^<]+)</h2>', r'<h2 class="text-lg font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2"><i class="fa-solid fa-layer-group text-orange-500"></i> \1</h2>', html)
html = re.sub(r'<h3>([^<]+)</h3>', r'<h3 class="text-md font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2"><i class="fa-solid fa-share-nodes text-orange-500"></i> \1</h3>', html)
# 8. HR
html = re.sub(r'<hr>', '', html) # Remove HR since headings have bottom borders

# Form Section wrapper
html = html.replace('class="form-section"', 'class="form-section bg-white p-6 shadow-xl rounded-2xl border border-gray-100"')

with open('index.html', 'w') as f:
    f.write(html)
