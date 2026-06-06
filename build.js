const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '_projects');
const outputFile  = path.join(__dirname, 'projects.json');

if (!fs.existsSync(projectsDir)) {
  console.log('No _projects folder found, writing empty array.');
  fs.writeFileSync(outputFile, '[]');
  process.exit(0);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove surrounding quotes
    val = val.replace(/^["']|["']$/g, '');
    fm[key] = val;
  });
  return fm;
}

const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));

const projects = files.map(file => {
  const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
  const fm = parseFrontmatter(content);
  return {
    en:      fm.title_en    || '',
    fa:      fm.title_fa    || '',
    catEn:   fm.category_en || '',
    catFa:   fm.category_fa || '',
    descEn:  fm.description_en || '',
    descFa:  fm.description_fa || '',
    lnk:     fm.instagram_url  || '#',
    img:     fm.cover          || 'portrait.jpg',
    order:   parseInt(fm.order || '99'),
  };
}).sort((a, b) => a.order - b.order);

fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
console.log(`✅ Generated projects.json with ${projects.length} projects`);
