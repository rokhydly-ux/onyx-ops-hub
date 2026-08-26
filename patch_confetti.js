const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The user wants confetti when a promo code is applied.
// We can use react-confetti. We need to import it and use it when isShopPromoApplied is true.
// BUT we also need to add useWindowSize.
// Let's just do a simpler confetti that shows for a few seconds.

const confettiImport = `import Confetti from 'react-confetti';\n`;
if (!content.includes('react-confetti')) {
    content = content.replace(`import React, { useState, useEffect, useRef } from "react";`, `import React, { useState, useEffect, useRef } from "react";\n${confettiImport}`);
}

const confettiComponent = `
      {/* CONFETTI */}
      {isShopPromoApplied && <div className="fixed inset-0 z-[9999] pointer-events-none"><Confetti recycle={false} numberOfPieces={500} /></div>}
`;

if (!content.includes('react-confetti')) {
    const hook = `{/* TOAST NOTIFICATION */}`;
    content = content.replace(hook, confettiComponent + '\n      ' + hook);
    console.log("Added confetti");
}

fs.writeFileSync('src/app/nutrition/page.tsx', content, 'utf8');
