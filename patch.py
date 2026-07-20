import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Change lg:col-span-7 to lg:col-span-4
content = content.replace('<div className="lg:col-span-7 space-y-8">', '<div className="lg:col-span-4 space-y-8">')

# Extract the Body Measures and the buttons section
body_measures_match = re.search(r'\{/\* Body Measures \*/\}(.*?)</form>\s*<div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">(.*?)</div>\s*</div>\s*</div>', content, re.DOTALL)

if body_measures_match:
    body_measures_html = body_measures_match.group(1).strip()
    buttons_html = body_measures_match.group(2).strip()

    # Remove the Body Measures from the left column, leave </form>
    content = content[:body_measures_match.start()] + '</form>\n                     </div>\n                 </div>' + content[body_measures_match.end():]

    # Replace the middle column class lg:col-span-5 to lg:col-span-4
    content = content.replace('<div className="lg:col-span-5 hidden lg:flex justify-center items-center relative h-full min-h-[600px]">', '                 {/* Center Column: Line-Art Illustration */}\n                 <div className="lg:col-span-4 hidden lg:flex justify-center items-center relative h-full min-h-[600px]">')

    right_column = f"""

                 {{/* Right Column: Body Measures */}}
                 <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        {{/* Body Measures */}}
                        {body_measures_html}

                        <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                           {buttons_html.replace('sm:w-auto', 'w-full').replace('w-full w-full', 'w-full')}
                        </div>
                    </div>
                 </div>
"""

    # Insert the right column after the center column
    center_column_end = content.find('</div>', content.find('{/* Center Column: Line-Art Illustration */}'))
    # Actually, the center column ends with </div> just before `</div>` and `{/* Bottom Bento & Services */}`
    bento_index = content.find('{/* Bottom Bento & Services */}')
    # find the `</div>` before bento_index
    div_before_bento = content.rfind('</div>', 0, bento_index)

    content = content[:div_before_bento] + right_column + content[div_before_bento:]

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)
