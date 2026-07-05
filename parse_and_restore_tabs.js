const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/nutrition/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

const oldPagePath = path.join(__dirname, 'old_nutrition.tsx');
let oldPageCode = fs.readFileSync(oldPagePath, 'utf8');

function extractTab(tabName) {
    const startStr = `{activeTab === '${tabName}' && (`;
    const startIndex = oldPageCode.indexOf(startStr);
    if (startIndex === -1) return null;

    let balance = 0;
    let inJSX = false;
    for (let i = startIndex; i < oldPageCode.length; i++) {
        if (oldPageCode.substring(i, i+1) === '{') balance++;
        if (oldPageCode.substring(i, i+1) === '}') balance--;

        if (balance === 0) {
            return oldPageCode.substring(startIndex, i + 1);
        }
    }
    return null;
}

const blogJSX = extractTab('blog');
const historyJSX = extractTab('history');
const coachingJSX = extractTab('coaching');

let restoredCount = 0;

if (blogJSX && !pageCode.includes(`{activeTab === 'blog' && (`)) {
    // Add before <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0"> (the right sidebar)
    // or before `{activeTab === 'settings' && (`
    pageCode = pageCode.replace(/{activeTab === 'profile' && \(/, `${blogJSX}\n\n        {activeTab === 'profile' && (`);
    restoredCount++;
}

if (historyJSX && !pageCode.includes(`{activeTab === 'history' && (`)) {
    pageCode = pageCode.replace(/{activeTab === 'profile' && \(/, `${historyJSX}\n\n        {activeTab === 'profile' && (`);
    restoredCount++;
}

if (coachingJSX && !pageCode.includes(`{activeTab === 'coaching' && (`)) {
    pageCode = pageCode.replace(/{activeTab === 'profile' && \(/, `${coachingJSX}\n\n        {activeTab === 'profile' && (`);
    restoredCount++;
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log(`Restored ${restoredCount} tabs`);
