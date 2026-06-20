with open('assets/script.js', 'r') as f:
    js = f.read()

# Replace addRow template
old_add_row = """    let row = `
    <tr>
        <td>
            <input type="text" class="desc w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Item description" oninput="updateInvoice()">
        </td>
        <td>
            <input type="number" class="price w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="0" min="0" step="0.01" oninput="updateInvoice()">
        </td>
        <td>
            <input type="number" class="qty w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="1" min="1" oninput="updateInvoice()">
        </td>
        <td class="lineTotal">0.00</td>
        <td>
            <button type="button" onclick="removeRow(this)" class="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-2 rounded-md w-full transition">X</button>
        </td>
    </tr>
    `;"""
    
new_add_row = """    let row = `
    <div class="item-row relative bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2 shadow-sm">
        <button type="button" onclick="removeRow(this)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold px-2 py-1 transition"><i class="fa-solid fa-xmark"></i></button>
        <div class="mb-2 pr-8">
            <label class="text-xs text-gray-500 mb-1 block">Item Description</label>
            <input type="text" class="desc w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Flight Ticket" oninput="updateInvoice()">
        </div>
        <div class="flex gap-2 items-center">
            <div class="flex-1">
                <label class="text-xs text-gray-500 mb-1 block">Price</label>
                <input type="number" class="price w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="0" min="0" step="0.01" oninput="updateInvoice()">
            </div>
            <div class="w-20">
                <label class="text-xs text-gray-500 mb-1 block">Qty</label>
                <input type="number" class="qty w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value="1" min="1" oninput="updateInvoice()">
            </div>
            <div class="w-24 text-right pt-5">
                <span class="text-xs text-gray-400 block">Total</span>
                <span class="lineTotal font-bold text-gray-700 text-sm">0.00</span>
            </div>
        </div>
    </div>
    `;"""
js = js.replace(old_add_row, new_add_row)

# Replace removeRow
js = js.replace('btn.closest("tr").remove();', 'btn.closest(".item-row").remove();')

# Replace addSocialRow template
old_add_social = """    let row = `
    <tr>
        <td>
            <select class="socialPlatform w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" onchange="updateInvoice()">
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="X">X (Twitter)</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="WhatsApp">WhatsApp</option>
            </select>
        </td>
        <td>
            <input type="text" class="socialValue w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="@username or URL" oninput="updateInvoice()">
        </td>
        <td>
            <button type="button" onclick="removeSocialRow(this)" class="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-2 rounded-md w-full transition">X</button>
        </td>
    </tr>
    `;"""

new_add_social = """    let row = `
    <div class="item-row relative flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm">
        <div class="w-1/3">
            <select class="socialPlatform w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" onchange="updateInvoice()">
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="X">X (Twitter)</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="WhatsApp">WhatsApp</option>
            </select>
        </div>
        <div class="flex-1">
            <input type="text" class="socialValue w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="@username or URL" oninput="updateInvoice()">
        </div>
        <button type="button" onclick="removeSocialRow(this)" class="text-red-400 hover:text-red-600 font-bold px-3 transition"><i class="fa-solid fa-xmark"></i></button>
    </div>
    `;"""
js = js.replace(old_add_social, new_add_social)

# Update selectors in updateInvoice
js = js.replace('document.querySelectorAll("#socialItems tr")', 'document.querySelectorAll("#socialItems .item-row")')
js = js.replace('let pkgRows = document.querySelectorAll("#invoiceItems tr");', 'let pkgRows = document.querySelectorAll("#invoiceItems .item-row");')
js = js.replace('let addonRows = document.querySelectorAll("#addonItems tr");', 'let addonRows = document.querySelectorAll("#addonItems .item-row");')

with open('assets/script.js', 'w') as f:
    f.write(js)
