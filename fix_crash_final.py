import re

with open('src/app/nutrition/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I found that SearchFoodModal is being rendered TWICE in page.tsx. Once at the top (line 358) outside of the main component scope (probably inside a helper or just misplaced) and once at the bottom (line 7594)
# Let's inspect line 356
