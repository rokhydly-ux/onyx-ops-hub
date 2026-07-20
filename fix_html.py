with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# I see grid grid-cols-1 lg:grid-cols-12 earlier.
# This means on mobile it will naturally stack.
# Let's verify by checking the parent div of the columns
index = content.find('<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">')
print("Grid index:", index)
