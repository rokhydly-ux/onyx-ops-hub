import re

with open('src/app/nutrition/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: The filter logic
# In the DB, what do we have? `r.instructions` and `r.ingredients` might be empty arrays `[]` or null.
# Wait, `!r.instructions && !r.ingredients` might mean that they don't have *either* one. What if instructions is empty but they have ingredients? Wait, recipes might be stored differently.
# Also, maybe `is_boutique` and `is_product` are strings "true"?
# To be completely safe and avoid wiping everything out, let's loosen the strict filter.

old_filter_code = """if (r.is_boutique === true || r.is_product === true) return false;
                         if (!r.instructions && !r.ingredients) return false;"""
new_filter_code = """if (r.is_boutique === true || r.is_boutique === 'true' || r.is_product === true || r.is_product === 'true') return false;
                         // Relaxing the strict filter: Only filter if it's explicitly a raw product without preparation
                         if (!r.instructions && !r.ingredients && !r.type) return false;"""

content = content.replace(old_filter_code, new_filter_code)

with open('src/app/nutrition/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
