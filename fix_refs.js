const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// We need to add `deliveryAddress`, `setDeliveryAddress`, and `handleLogout` to `page.tsx`
// Wait, `deliveryCost` is also missing if `deliveryAddress` is.
// Actually let's check `deliveryCost` in backup_page_main.tsx

const backup = fs.readFileSync('backup_page_main.tsx', 'utf8');

const missingDecl = `
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const deliveryCost = 2000;
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/nutriafro-login'; };
`;

// Insert it right after `const [showMobileHub, setShowMobileHub] = useState(false);`
content = content.replace(
    'const [showMobileHub, setShowMobileHub] = useState(false);',
    'const [showMobileHub, setShowMobileHub] = useState(false);\n' + missingDecl
);

fs.writeFileSync('src/app/nutrition/page.tsx', content, 'utf8');
console.log('Added missing variable declarations.');
