#!/bin/bash
file="src/components/nutrition/tabs/CartTab.tsx"

# 1. Add import for useCartStore
sed -i 's/import React from '"'"'react'"'"';/import React from '"'"'react'"'"';\nimport { useCartStore } from '"'"'@\/store\/useCartStore'"'"';/g' "$file"

# 2. Add the zustand store usages inside the CartTab component, right before return (
awk '/return \(/ && !inserted {print "  const removeFromCartZustand = useCartStore((state) => state.removeFromCart);\n  const updateQuantityZustand = useCartStore((state) => state.updateQuantity);\n"; inserted=1} 1' "$file" > tmp && mv tmp "$file"
