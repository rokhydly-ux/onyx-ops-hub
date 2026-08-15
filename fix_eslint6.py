import re

with open("src/app/nutrition/page.tsx", "r") as f:
    content = f.read()

# Fix unescaped entities
content = content.replace("J'en profite", "J&apos;en profite")

with open("src/app/nutrition/page.tsx", "w") as f:
    f.write(content)
