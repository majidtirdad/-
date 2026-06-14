const fs   = require('fs');
const path = require('path');

const dir  = path.join(__dirname, '_projects');
const out  = path.join(__dirname, 'projects.json');

if (!fs.existsSync(dir)) {
  console.log('No _projects folder — writing empty array');
  fs.writeFileSync(out, '[]');
  process.exit(0);
}

function parseFM(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i < 0) return;
    const k = line.slice(0, i).trim();
    let v   = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    fm[k]   = v;
  });
  return fm;
}

const files    = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
const projects = files.map(file => {
  const fm = parseFM(fs.readFileSync(path.join(dir, file), 'utf8'));
  return {
    en:     fm.title_en       || '',
    fa:     fm.title_fa       || '',
    catEn:  fm.category_en    || '',
    catFa:  fm.category_fa    || '',
    descEn: fm.description_en || '',
    descFa: fm.description_fa || '',
    lnk:    fm.instagram_url  || '#',
    img:    fm.cover          || 'portrait.jpg',
    order:  parseInt(fm.order || '99'),
  };
}).sort((a, b) => a.order - b.order);

fs.writeFileSync(out, JSON.stringify(projects, null, 2));
console.log(`✅ projects.json → ${projects.length} projects`);
