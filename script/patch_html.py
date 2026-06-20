with open('index.html', 'r') as f:
    html = f.read()

# Replace tables with divs for dynamic lists
html = html.replace('<table id="socialTable">\n                <tbody id="socialItems"></tbody>\n            </table>', '<div id="socialItems" class="flex flex-col gap-2 mt-2"></div>')
html = html.replace('<table id="itemsTable">\n            <tbody id="invoiceItems"></tbody>\n        </table>', '<div id="invoiceItems" class="flex flex-col gap-2"></div>')
html = html.replace('<table id="addonsTable">\n            <tbody id="addonItems"></tbody>\n        </table>', '<div id="addonItems" class="flex flex-col gap-2"></div>')

with open('index.html', 'w') as f:
    f.write(html)
