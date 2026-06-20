import re

# 1. Update index.html
with open('index.html', 'r') as f:
    html = f.read()

# Add currency selector at the very top of the form
currency_html = """
        <h2>Settings</h2>
        <label>Currency</label>
        <select id="currency" onchange="updateInvoice()">
            <option value="RM">MYR (RM)</option>
            <option value="฿">THB (฿)</option>
            <option value="₫">VND (₫)</option>
        </select>
        <hr>
        <h2>Company Details</h2>
"""
html = html.replace('<h2>Company Details</h2>', currency_html)

# Update table headers
html = html.replace('<th>UNIT PRICE (RM)</th>', '<th>UNIT PRICE (<span class="p_currency_lbl">RM</span>)</th>')
html = html.replace('<th>TOTAL (RM)</th>', '<th>TOTAL (<span class="p_currency_lbl">RM</span>)</th>')

with open('index.html', 'w') as f:
    f.write(html)


# 2. Update assets/script.js
with open('assets/script.js', 'r') as f:
    js = f.read()

# Replace hardcoded RM with dynamic currency
js = js.replace('function updateInvoice() {', """function updateInvoice() {
    let currency = document.getElementById("currency").value;
    document.querySelectorAll(".p_currency_lbl").forEach(el => el.innerText = currency);
""")

js = js.replace('"RM " + subtotal.toFixed(2)', 'currency + " " + subtotal.toFixed(2)')
js = js.replace('"RM " + deposit.toFixed(2)', 'currency + " " + deposit.toFixed(2)')
js = js.replace('"RM " + balance.toFixed(2)', 'currency + " " + balance.toFixed(2)')
js = js.replace('"RM " + taxVal.toFixed(2)', 'currency + " " + taxVal.toFixed(2)')
js = js.replace('"RM " + grand.toFixed(2)', 'currency + " " + grand.toFixed(2)')

# Ensure currency update triggers when changed
with open('assets/script.js', 'w') as f:
    f.write(js)

