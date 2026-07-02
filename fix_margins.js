const fs = require('fs');

let pageContent = fs.readFileSync('src/app/nutrition/page.tsx', 'utf8');

// The standardized container is:
// <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
//    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm w-full">

// Minute Doc
pageContent = pageContent.replace(/<div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-6xl mx-auto">/g, '<div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">');
pageContent = pageContent.replace(/<div className="bg-white dark:bg-zinc-900 p-8 rounded-\[2rem\] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-6">/g, '<div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-6 w-full">');

// Coach
pageContent = pageContent.replace(/<div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">/g, '<div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full max-w-6xl mx-auto">');
// Blog
pageContent = pageContent.replace(/<div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-7xl mx-auto">/g, '<div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">');


fs.writeFileSync('src/app/nutrition/page.tsx', pageContent);
