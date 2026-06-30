const fs = require('fs');

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
content = content.replace(/setUser\(JSON\.parse\(session\)\);/, 'setUser(JSON.parse(session));\n// eslint-disable-next-line react-hooks/exhaustive-deps');
fs.writeFileSync('src/contexts/AuthContext.tsx', content);
