import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Update the fetch query to also fetch `nutrition_profiles(diagnostic_data)`
# so we can access instagram, facebook, twitter.
search = ".select('*, clients!client_id(id, full_name, avatar_url, nutrition_profiles(diagnostic_data))')"
if "nutrition_profiles" not in content:
    content = content.replace(".select('*, clients!client_id(id, full_name, avatar_url)')", ".select('*, clients!client_id(id, full_name, avatar_url, nutrition_profiles(diagnostic_data))')")

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
