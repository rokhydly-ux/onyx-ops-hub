const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

const oldBilanRegex = /<button onClick=\{\(\) => setShowDailyReport\(true\)\} className="bg-\[\#39FF14\] p-6 rounded-\[\2rem\] border border-black shadow-\[0_0_25px_rgba\(57,255,20,0\.4\)\] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-\[1\.02\] transition-transform animate-gentle-pulse">/;

// Check if we need to add animate-gentle-pulse
if(!oldBilanRegex.test(pageCode)){
    // This means the button still doesn't have it or we are matching wrong
    // Let's use a looser match
    pageCode = pageCode.replace(/<button onClick=\{\(\) => setShowDailyReport\(true\)\} className="bg-\[\#39FF14\] p-6.*?">/, `<button onClick={() => setShowDailyReport(true)} className="bg-[#39FF14] p-6 rounded-[2rem] border border-black shadow-[0_0_25px_rgba(57,255,20,0.4)] flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform animate-gentle-pulse">`);
    fs.writeFileSync(pagePath, pageCode, 'utf8');
    console.log("Updated Bilan Animation.");
} else {
    console.log("Bilan animation already in place.");
}
