const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The standardized container is:
// <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
//    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm w-full">

// History
pageContent = pageContent.replace(/<div className="space-y-8 animate-in fade-in slide-in-from-left-4">/g, '<div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">');

// Weight
pageContent = pageContent.replace(/<div className="space-y-6 animate-in fade-in zoom-in duration-500">/g, '<div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">');
pageContent = pageContent.replace(/<div className="flex justify-between items-center bg-zinc-50 p-4 rounded-3xl border border-zinc-200 shadow-inner">/g, '<div className="flex justify-between items-center bg-zinc-50 p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm w-full">');


fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);
