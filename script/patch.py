import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Replace the static Facebook input with the dynamic Social Media section
social_html_form = """
        <label>Website</label>
        <input type="text" id="companyWebsite" value="">
        
        <h3>Social Media</h3>
        <details id="socialSection" open>
            <summary>Details</summary>
            <table id="socialTable">
                <tbody id="socialItems"></tbody>
            </table>
            <button type="button" onclick="addSocialRow()">+ Add Social Media</button>
        </details>
"""
html = re.sub(r'<label>Website</label>\s*<input type="text" id="companyWebsite" value="">\s*<label>Facebook</label>\s*<input type="text" id="companyFb" value="">', social_html_form, html)


# 2. Add preview container in the header center
# Original: <div class="contact-item"><i class="fa-brands fa-facebook"></i> <span id="p_cFb"></span></div>
social_preview_html = """<div id="previewCompanySocials"></div>"""
html = re.sub(r'<div class="contact-item"><i class="fa-brands fa-facebook"></i> <span id="p_cFb"></span></div>', social_preview_html, html)

with open('index.html', 'w') as f:
    f.write(html)
