import re

with open('src/app/nutrition/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print(len(content.splitlines()))

# Let's search for "favorites" to see where the activeTab === 'favorites' is.
for i, line in enumerate(content.splitlines()):
    if 'activeTab === "favorites"' in line or "activeTab === 'favorites'" in line:
        print(f"Line {i+1}: {line}")
