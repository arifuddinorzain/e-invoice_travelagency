with open('assets/script.js', 'r') as f:
    js = f.read()

# 1. Add social row functions at the top (after addRow / removeRow)
social_funcs = """
function addSocialRow() {
    let row = `
    <tr>
        <td>
            <select class="socialPlatform" onchange="updateInvoice()">
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
            <input type="text" class="socialValue" placeholder="@username or URL" oninput="updateInvoice()">
        </td>
        <td>
            <button type="button" onclick="removeSocialRow(this)">X</button>
        </td>
    </tr>
    `;
    document.getElementById("socialItems").insertAdjacentHTML("beforeend", row);
    updateInvoice();
}

function removeSocialRow(btn) {
    btn.closest("tr").remove();
    updateInvoice();
}
"""

js = js.replace('function updateInvoice() {', social_funcs + '\nfunction updateInvoice() {')

# 2. Update updateInvoice to handle social media
social_update_logic = """
    // Social Media
    let socialHtml = "";
    document.querySelectorAll("#socialItems tr").forEach(row => {
        let platform = row.querySelector(".socialPlatform").value;
        let value = row.querySelector(".socialValue").value;
        if(value.trim() !== "") {
            let icon = "";
            switch(platform){
                case "Facebook": icon = "fa-brands fa-facebook"; break;
                case "Instagram": icon = "fa-brands fa-instagram"; break;
                case "TikTok": icon = "fa-brands fa-tiktok"; break;
                case "X": icon = "fa-brands fa-x-twitter"; break;
                case "LinkedIn": icon = "fa-brands fa-linkedin"; break;
                case "YouTube": icon = "fa-brands fa-youtube"; break;
                case "WhatsApp": icon = "fa-brands fa-whatsapp"; break;
            }
            socialHtml += `<div class="contact-item"><i class="${icon}"></i> <span>${value}</span></div>`;
        }
    });
    let socialContainer = document.getElementById("previewCompanySocials");
    if(socialContainer) socialContainer.innerHTML = socialHtml;
"""

# replace old fb line
old_fb_line = 'document.getElementById("p_cFb").innerText = document.getElementById("companyFb").value;'
js = js.replace(old_fb_line, social_update_logic)

# 3. Init call at the end
js = js.replace('addRow(\'invoiceItems\');\nupdateInvoice();', 'addRow(\'invoiceItems\');\naddSocialRow();\nupdateInvoice();')

with open('assets/script.js', 'w') as f:
    f.write(js)
