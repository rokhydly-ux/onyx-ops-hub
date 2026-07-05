const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Check BentoDashboardView invocation
const bentoRegex = /<BentoDashboardView[\s\S]*?\/>/g;
const match = pageCode.match(bentoRegex);
if(match) {
    let newInvocation = match[0];
    if(!newInvocation.includes('waterGlasses=')) {
        newInvocation = newInvocation.replace('/>', ' waterGlasses={waterGlasses} handleUpdateWater={handleUpdateWater} />');
        pageCode = pageCode.replace(match[0], newInvocation);
        fs.writeFileSync(pagePath, pageCode, 'utf8');
        console.log('Updated page.tsx with new props for BentoDashboardView');
    }
} else {
    console.log("Could not find BentoDashboardView invocation.");
}

const bentoPath = path.join(__dirname, 'src/components/dashboard/BentoDashboardView.tsx');
let bentoCode = fs.readFileSync(bentoPath, 'utf8');

// Update Interface
if(!bentoCode.includes('waterGlasses: number')) {
    bentoCode = bentoCode.replace('handleMealClick?: (mealType: string, prefillRecipe: any, contextType: string) => void;', 'handleMealClick?: (mealType: string, prefillRecipe: any, contextType: string) => void;\n    waterGlasses: number;\n    handleUpdateWater: (amount: number) => void;');
    bentoCode = bentoCode.replace('export default function BentoDashboardView({ user,   jongomaXP, clientProfile, setActiveTab, handleMealClick }: BentoDashboardViewProps) {', 'export default function BentoDashboardView({ user,   jongomaXP, clientProfile, setActiveTab, handleMealClick, waterGlasses, handleUpdateWater }: BentoDashboardViewProps) {');
    bentoCode = bentoCode.replace('import { Activity, Droplet, Moon, Search, Bell, LogOut,', 'import { Activity, Droplet, Moon, Search, Bell, LogOut, Plus,');

    fs.writeFileSync(bentoPath, bentoCode, 'utf8');
    console.log("Updated BentoDashboardView props");
}
