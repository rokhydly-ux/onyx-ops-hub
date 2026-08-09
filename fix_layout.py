import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Locate the activeTab === 'blog' && selectedArticle block
# Old container classes: bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm
# New container classes: bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-10 lg:p-12 shadow-sm space-y-6

content = content.replace(
    'className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm"',
    'className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-10 lg:p-12 shadow-sm space-y-6"'
)

# Badges container
content = content.replace(
    '<div className="flex items-center gap-3 mb-6">',
    '<div className="flex items-center gap-3 mb-4">'
)

# Title typography
content = content.replace(
    '<h1 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase text-black dark:text-white mb-8 leading-tight`}>{selectedArticle.title}</h1>',
    '<h1 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase text-zinc-900 dark:text-white tracking-tight leading-tight mb-6`}>{selectedArticle.title}</h1>'
)

# Image styling
# old: className="w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-8 shadow-md"
# new: className="w-full h-[300px] md:h-[450px] rounded-[1.5rem] overflow-hidden my-6 shadow-sm"
content = content.replace(
    'className="w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-8 shadow-md"',
    'className="w-full h-[300px] md:h-[450px] rounded-[1.5rem] overflow-hidden my-6 shadow-sm"'
)

# Similar articles top margin
content = content.replace(
    '<div>\n                   <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 text-black dark:text-white`}>Articles <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-400">Similaires</span></h3>',
    '<div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800">\n                   <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 text-black dark:text-white`}>Articles <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-400">Similaires</span></h3>'
)

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
