#!/bin/bash

# Change default active tab to dashboard
sed -i "s/useState<'today' | 'week' | 'history'/useState<'dashboard' | 'today' | 'week' | 'history'/" src/app/nutrition/page.tsx
sed -i "s/useState<.*>('week')/useState<any>('dashboard')/" src/app/nutrition/page.tsx
sed -i "s/useState<.*>('today')/useState<any>('dashboard')/" src/app/nutrition/page.tsx
