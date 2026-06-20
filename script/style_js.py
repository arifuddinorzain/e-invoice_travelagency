with open('assets/script.js', 'r') as f:
    js = f.read()

# Update dynamic inputs in JS with tailwind classes
old_desc = '<input type="text" class="desc" placeholder="Item description" oninput="updateInvoice()">'
new_desc = '<input type="text" class="desc w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Item description" oninput="updateInvoice()">'
js = js.replace(old_desc, new_desc)

old_price = '<input type="number" class="price" value="0" min="0" step="0.01" oninput="updateInvoice()">'
new_price = '<input type="number" class="price w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="0" min="0" step="0.01" oninput="updateInvoice()">'
js = js.replace(old_price, new_price)

old_qty = '<input type="number" class="qty" value="1" min="1" oninput="updateInvoice()">'
new_qty = '<input type="number" class="qty w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="1" min="1" oninput="updateInvoice()">'
js = js.replace(old_qty, new_qty)

old_btn_remove = '<button type="button" onclick="removeRow(this)">X</button>'
new_btn_remove = '<button type="button" onclick="removeRow(this)" class="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-2 rounded-md w-full transition">X</button>'
js = js.replace(old_btn_remove, new_btn_remove)

old_soc_sel = '<select class="socialPlatform" onchange="updateInvoice()">'
new_soc_sel = '<select class="socialPlatform w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" onchange="updateInvoice()">'
js = js.replace(old_soc_sel, new_soc_sel)

old_soc_val = '<input type="text" class="socialValue" placeholder="@username or URL" oninput="updateInvoice()">'
new_soc_val = '<input type="text" class="socialValue w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="@username or URL" oninput="updateInvoice()">'
js = js.replace(old_soc_val, new_soc_val)

old_btn_rem_soc = '<button type="button" onclick="removeSocialRow(this)">X</button>'
new_btn_rem_soc = '<button type="button" onclick="removeSocialRow(this)" class="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-2 rounded-md w-full transition">X</button>'
js = js.replace(old_btn_rem_soc, new_btn_rem_soc)

with open('assets/script.js', 'w') as f:
    f.write(js)
