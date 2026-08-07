import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# We need to compute the cleaned content and AI note, we can do this within the component render block
# Let's insert a small functional component or logic right above the return for the detailed view?
# No, we can just do it inline inside the JSX if we use an IIFE, or we can just replace the dangerouslySetInnerHTML part.

logic = """
                     {(() => {
                        let textToRender = selectedArticle.content || selectedArticle.desc || '';

                        // 1. Clean Redundant Title
                        textToRender = textToRender.replace(/^Titre\\s*:.*(\\r?\\n|$)/im, '');

                        // 2. Extract AI Note
                        let aiNote = null;
                        const aiNoteMatch = textToRender.match(/\\[([^\\]]+IA[^\\]]+)\\]/i) || textToRender.match(/\\[(Généré[^\\]]+)\\]/i);
                        if (aiNoteMatch) {
                           aiNote = aiNoteMatch[0];
                           textToRender = textToRender.replace(aiNote, '');
                        }

                        // 3. Split into paragraphs
                        const paragraphs = textToRender.split(/\\n+/).filter((p: string) => p.trim() !== '');

                        return (
                           <div className="flex flex-col">
                              {paragraphs.map((paragraph: string, index: number) => (
                                 <p key={index} className="mb-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base md:text-lg font-normal" dangerouslySetInnerHTML={{ __html: paragraph }} />
                              ))}

                              {aiNote && (
                                 <div className="mt-8 text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    {aiNote}
                                 </div>
                              )}
                           </div>
                        );
                     })()}
"""

# Replace the old logic
old_logic = """
                     {selectedArticle.content ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\\n/g, '<br/>') }} />
                     ) : (
                        <p>{selectedArticle.desc}</p>
                     )}
"""

# The code in the file is replacing `\n` without escaping, so it looks like `/\n/g` instead of `/\\n/g`
content = content.replace("                     {selectedArticle.content ? (\n                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\\n/g, '<br/>') }} />\n                     ) : (\n                        <p>{selectedArticle.desc}</p>\n                     )}", logic.strip())

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
