const fs = require('fs');

let content = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

const bmrStateDef = `  const [bmr, setBmr] = useState(0);\n`;
content = content.replace('  const [calorieGoal, setCalorieGoal] = useState(0);', bmrStateDef + '  const [calorieGoal, setCalorieGoal] = useState(0);');

const target1 = `    if (navigator.onLine) {
       handleOnline();
    }



    useEffect(() => {
        const fetchCatalogue = async () => {`;

const rep1 = `    if (navigator.onLine) {
       handleOnline();
    }

    return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
        const fetchCatalogue = async () => {`;
content = content.replace(target1, rep1);

const target2 = `        fetchCatalogue();
    }, []);

    const verifyAuth = async () => {`;

const rep2 = `        fetchCatalogue();
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {`;
content = content.replace(target2, rep2);

const target3 = `    verifyAuth();

    return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
    };

    // Afficher un message de bienvenue après le diagnostic
    if (searchParams.get('from') === 'diagnostic') {
      alert("Félicitations et bienvenue ! Votre espace personnel est prêt.");
      // Nettoyer l'URL
      router.replace('/nutrition');
    }

  }, [router, searchParams]);`;

const rep3 = `    verifyAuth();
  }, [router, searchParams]);

  useEffect(() => {
    // Afficher un message de bienvenue après le diagnostic
    if (searchParams.get('from') === 'diagnostic') {
      alert("Félicitations et bienvenue ! Votre espace personnel est prêt.");
      // Nettoyer l'URL
      router.replace('/nutrition');
    }
  }, [router, searchParams]);`;
content = content.replace(target3, rep3);


const earlyReturn = `  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }`;

// Find where to move the early return
// It needs to be after ALL hooks.
// We can just find the first non-hook statement returning JSX, or the end of the component hooks
content = content.replace(earlyReturn, '');
const endOfHooksTarget = `  const dayIndex = new Date().getDay();`;
content = content.replace(endOfHooksTarget, earlyReturn + `\n\n` + endOfHooksTarget);

fs.writeFileSync('src/app/nutrition/page.tsx', content);
