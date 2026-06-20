import re

# 1. Update CSS
with open('assets/style.css', 'r') as f:
    css = f.read()

# Increase left padding from 30px to 60px to avoid the curve
css = css.replace('padding: 40px 30px;', 'padding: 40px 30px 40px 50px;')

with open('assets/style.css', 'w') as f:
    f.write(css)

# 2. Update JS Date Formatting
with open('assets/script.js', 'r') as f:
    js = f.read()

date_formatter = """function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function updateInvoice() {"""

js = js.replace('function updateInvoice() {', date_formatter)

js = js.replace('document.getElementById("p_invDate").innerText = document.getElementById("invoiceDate").value || \'-\';', 'document.getElementById("p_invDate").innerText = formatDate(document.getElementById("invoiceDate").value);')
js = js.replace('document.getElementById("p_invDue").innerText = document.getElementById("dueDate").value || \'-\';', 'document.getElementById("p_invDue").innerText = formatDate(document.getElementById("dueDate").value);')
js = js.replace('document.getElementById("m_due").innerText = document.getElementById("dueDate").value || \'-\'; // Sync', 'document.getElementById("m_due").innerText = formatDate(document.getElementById("dueDate").value); // Sync')

with open('assets/script.js', 'w') as f:
    f.write(js)
