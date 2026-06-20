import re

# 1. Update HTML
with open('index.html', 'r') as f:
    html = f.read()

settings_header = '<h2>Settings</h2>'
# Wait, it was changed to <h4>
# Let's find exactly what it is.
