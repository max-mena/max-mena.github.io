const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const dataDir = path.join(__dirname, '../data');
const templateDir = path.join(__dirname, '../templates');
const outDir = path.join(__dirname, '../');
const postsOutDir = path.join(outDir, 'posts');

// Icon + gradient mapping by first tag
const tagThemes = {
  'ai': { icon: '🤖', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  'important': { icon: '📌', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  'DevOps': { icon: '⚙️', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  'IoT': { icon: '📡', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  'Security': { icon: '🔐', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  'Blockchain': { icon: '🔗', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
};
const defaultTheme = { icon: '📄', gradient: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)' };

// 1. Read Data and Templates
const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8'));
const listTemplate = fs.readFileSync(path.join(templateDir, 'project-list.html'), 'utf-8');
const detailTemplate = fs.readFileSync(path.join(templateDir, 'post-detail.html'), 'utf-8');

let tilesHtml = '';

if (!fs.existsSync(postsOutDir)) {
  fs.mkdirSync(postsOutDir, { recursive: true });
}

// 2. Generate Individual Pages
projects.forEach(project => {
  const mdPath = path.join(dataDir, 'publications', project.content_file);
  if (!fs.existsSync(mdPath)) return; // Fail-safe for missing files

  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const htmlContent = marked.parse(mdContent);

  // Inject content into the template
  const pageHtml = detailTemplate
    .replace('{{TITLE}}', project.title)
    .replace('{{DESCRIPTION}}', `An article about ${project.tags.join(', ')} by Max Mena.`)
    .replace('{{CONTENT}}', htmlContent);

  const outFileName = `${project.id}.html`;
  fs.writeFileSync(path.join(postsOutDir, outFileName), pageHtml);

  // 3. Build the Tile string
  const theme = tagThemes[project.tags[0]] || defaultTheme;
  const tagsHtml = project.tags.map(t => `<span class="tile-tag">${t}</span>`).join('');
  tilesHtml += `
    <article class="project-tile">
      <div class="tile-icon-wrapper" style="background: ${theme.gradient}">
        <span class="tile-icon">${theme.icon}</span>
      </div>
      <h2 class="tile-title"><a href="posts/${outFileName}">${project.title}</a></h2>
      <p class="tile-date">${project.date}</p>
      <div class="tile-tags">${tagsHtml}</div>
    </article>
  `;
});

// 4. Generate the main projects.html page
const finalProjectsPage = listTemplate.replace('{{TILES}}', tilesHtml);
fs.writeFileSync(path.join(outDir, 'projects.html'), finalProjectsPage);

console.log('✅ Build complete using HTML templates!');