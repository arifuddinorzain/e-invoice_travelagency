import re

with open('assets/script.js', 'r') as f:
    js = f.read()

# Replace addRow function entirely
def repl_addrow(m):
    return """function addRow(tableId) {
    let row = `
    <div class="item-row bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm hover:shadow-md transition">
        <div class="flex justify-between items-center mb-1.5">
            <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Description</label>
            <button type="button" onclick="removeRow(this)" class="text-gray-300 hover:text-red-500 transition p-1" title="Remove Item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        <input type="text" class="desc w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none mb-3 bg-gray-50 hover:bg-white transition" placeholder="e.g. Flight Ticket" oninput="updateInvoice()">
        
        <div class="flex gap-3 items-end">
            <div class="flex-1">
                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Unit Price</label>
                <input type="number" class="price w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 hover:bg-white transition" value="0.00" min="0" step="0.01" oninput="updateInvoice()">
            </div>
            <div class="w-20">
                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Qty</label>
                <input type="number" class="qty w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 hover:bg-white transition text-center" value="1" min="1" oninput="updateInvoice()">
            </div>
            <div class="w-24 text-right pb-1">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total</span>
                <span class="lineTotal font-extrabold text-gray-800 text-base tracking-tight">0.00</span>
            </div>
        </div>
    </div>
    `;
    document.getElementById(tableId).insertAdjacentHTML("beforeend", row);
    updateInvoice();
}"""

js = re.sub(r'function addRow\(tableId\) \{.*?\n\}', repl_addrow, js, flags=re.DOTALL)

# Replace addSocialRow function entirely
def repl_addsocial(m):
    return """function addSocialRow() {
    let row = `
    <div class="item-row flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition mb-2">
        <div class="w-1/3">
            <select class="socialPlatform w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 cursor-pointer" onchange="updateInvoice()">
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
            <input type="text" class="socialValue w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 hover:bg-white transition" placeholder="@username or URL" oninput="updateInvoice()">
        </div>
        <button type="button" onclick="removeSocialRow(this)" class="text-gray-300 hover:text-red-500 transition p-2" title="Remove Social Media">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    </div>
    `;
    document.getElementById("socialItems").insertAdjacentHTML("beforeend", row);
    updateInvoice();
}"""

js = re.sub(r'function addSocialRow\(\) \{.*?\n\}', repl_addsocial, js, flags=re.DOTALL)

with open('assets/script.js', 'w') as f:
    f.write(js)
