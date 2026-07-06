const fs = require('fs');
const file = 'src/app/tontine/[slug]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'export default function TontinePage({ params }: { params: { slug: string } }) {',
  'export default function TontinePage({ params }: { params: Promise<{ slug: string }> }) {'
);

// We need to check if slug is extracted synchronously.
// Let's first read the file to see how it's used.
