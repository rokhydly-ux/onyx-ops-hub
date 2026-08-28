const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const confettiImport = `import Confetti from 'react-confetti';\n`;
if (!content.includes('react-confetti')) {
    content = content.replace(`import React, { useState, useEffect, useRef } from "react";`, `import React, { useState, useEffect, useRef } from "react";\n${confettiImport}`);
}

const confettiComponent = `
      {/* CONFETTI */}
      {showConfetti && <div className="fixed inset-0 z-[9999] pointer-events-none"><Confetti recycle={false} numberOfPieces={500} /></div>}
`;

// Let's create a state for it
if (!content.includes('showConfetti')) {
    const hookState = `const [toastMessage, setToastMessage] = useState<string | null>(null);`;
    content = content.replace(hookState, hookState + `\n  const [showConfetti, setShowConfetti] = useState(false);`);

    // Add effect to trigger confetti when promo is applied
    const hookEffect = `useEffect(() => {
    if (isShopPromoApplied) {
       setShowConfetti(true);
       setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [isShopPromoApplied]);`;

    content = content.replace(`// Effet de bienvenue`, hookEffect + `\n\n  // Effet de bienvenue`);

    const hookRender = `{/* TOAST NOTIFICATION */}`;
    content = content.replace(hookRender, confettiComponent + '\n      ' + hookRender);
    console.log("Added confetti completely");
}

fs.writeFileSync('src/app/nutrition/page.tsx', content, 'utf8');
