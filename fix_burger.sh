#!/bin/bash
FILE="src/components/nutrition/tabs/CommunityTab.tsx"
# Let's clean up those multiple `activeFeedFilter === 'all'` from line 41
sed -i 's/activeTab === '"'"'community'"'"' \&\& activeFeedFilter === '"'"'all'"'"' \&\& activeFeedFilter === '"'"'all'"'"'/activeTab === '"'"'community'"'"' \&\& activeFeedFilter === '"'"'all'"'"'/g' "$FILE"

sed -i '/const \[activeFeedFilter, setActiveFeedFilter\] = React\.useState("all");/{
  x;
  /./!{
    x;
    h;
    p;
  };
  d;
}' "$FILE"
