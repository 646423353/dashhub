import fs from 'fs';
import path from 'path';

const srcDir = './frontend/src';
const files = [
  'views/Leaderboard.vue',
  'views/EditProject.vue',
  'views/CreatorProfile.vue',
  'views/CreateProject.vue',
  'views/ProjectDetail.vue',
  'views/Search.vue',
  'views/Home.vue',
  'views/Profile.vue',
  'views/MyProjects.vue',
];

const oldStr = "const serverBase = 'http://localhost:3001';";
const newStr = "const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';";

let count = 0;
for (const f of files) {
  const fullPath = path.join(srcDir, f);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(oldStr)) {
    content = content.split(oldStr).join(newStr);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('Updated: ' + f);
    count++;
  }
}
console.log(`Done. ${count} file(s) updated.`);
