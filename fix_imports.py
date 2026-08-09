with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("} , Instagram, Facebook, Twitter } from 'lucide-react';", ", Instagram, Facebook, Twitter } from 'lucide-react';")

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
