const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

if (!content.includes('showConfetti')) {
    const hookState = `const [toastMessage, setToastMessage] = useState<string | null>(null);`;
    content = content.replace(hookState, hookState + `\n  const [showConfetti, setShowConfetti] = useState(false);`);

    // Add effect to trigger confetti when promo is applied
    const hookEffect = `  useEffect(() => {
    if (isShopPromoApplied) {
       setShowConfetti(true);
       setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [isShopPromoApplied]);`;

    content = content.replace(`useEffect(() => {
    const handleMouseLeave =`, hookEffect + `\n\n  useEffect(() => {\n    const handleMouseLeave =`);

    const confettiComponent = `
      {/* CONFETTI */}
      {showConfetti && <div className="fixed inset-0 z-[9999] pointer-events-none"><Confetti recycle={false} numberOfPieces={500} /></div>}
`;
    const hookRender = `{/* TOAST NOTIFICATION */}`;
    content = content.replace(hookRender, confettiComponent + '\n      ' + hookRender);
    console.log("Added confetti completely 2");
}

fs.writeFileSync('src/app/nutrition/page.tsx', content, 'utf8');
