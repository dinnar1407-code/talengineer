// 用户手册 md → 排版 HTML → Chrome headless 打印 PDF
// 用法：node scripts/gen-manual-pdf.js [md路径]，PDF 落在同目录同名 .pdf。
// 依赖：marked（已装）+ 本机 Chrome（macOS 路径）。改版手册后重跑一次即可。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');

const mdPath = process.argv[2] || 'docs/manual/TalEngineer_用户使用手册_v1.md';
const src = fs.readFileSync(mdPath, 'utf8');
const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
const body = fm ? src.slice(fm[0].length) : src;
const meta = {};
if (fm) fm[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });

// 真实品牌 logo：直接内联仓库里的 SVG（封面用大图，避免外链）
const logoSvg = fs.readFileSync(path.join(__dirname, '..', 'public/img/logo-macaw.svg'), 'utf8');
const logoDataUri = 'data:image/svg+xml;base64,' + Buffer.from(logoSvg).toString('base64');

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${meta.title || 'Manual'}</title><style>
  /* 品牌主色调：navy #0a1626 / 品牌蓝 #0056b3 / 琥珀 #ffc107（与官网深色主题一致） */
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 18mm 16mm; }
  @page :first { margin: 0; }  /* 封面满版出血 */
  body { font-family: "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; color:#1f2937; line-height:1.8; font-size:11pt; margin:0; }
  .cover { background:#0a1626; color:#e6edf6; width:100%; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; page-break-after: always; }
  .cover img.logo { width:110px; height:110px; margin-bottom:28px; }
  .cover h1 { border:none; font-size:27pt; color:#ffffff; margin:0 0 10px; }
  .cover .tagline { color:#8ba0bd; font-size:12pt; }
  .cover .bar { width:64px; height:4px; background:#ffc107; border-radius:2px; margin:26px auto; }
  .cover .meta { color:#4d9fff; font-size:10.5pt; line-height:2; }
  .content { padding:0; }
  h1 { color:#0056b3; font-size:20pt; border-bottom:3px solid #0056b3; padding-bottom:8px; }
  h2 { color:#0056b3; font-size:15pt; margin-top:28px; border-left:4px solid #ffc107; padding-left:10px; page-break-after: avoid; }
  h3 { font-size:12.5pt; margin-top:20px; page-break-after: avoid; }
  table { border-collapse: collapse; width:100%; font-size:10pt; margin:10px 0; }
  th,td { border:1px solid #d1d5db; padding:6px 10px; text-align:left; vertical-align:top; }
  th { background:#f1f5f9; }
  blockquote { border-left:4px solid #0056b3; background:#f8fafc; margin:12px 0; padding:10px 16px; color:#374151; }
  code { background:#f1f5f9; padding:1px 5px; border-radius:4px; font-size:10pt; }
  hr { border:none; border-top:1px solid #e5e7eb; margin:22px 0; }
  li { margin:4px 0; }
  img { max-width:100%; border:1px solid #d1d5db; border-radius:8px; margin:12px 0 4px; page-break-inside: avoid; }
  img + em, p > img + em { display:block; color:#6b7280; font-size:9.5pt; text-align:center; margin-bottom:12px; }
</style></head><body>
<div class="cover">
  <img class="logo" src="${logoDataUri}" alt="Talengineer"/>
  <h1>${meta.title || ''}</h1>
  <div class="tagline">Certified Industrial Automation Engineers, On Demand</div>
  <div class="bar"></div>
  <div class="meta">${meta.version || ''} · ${meta.date || ''}<br/>${meta.site || ''}</div>
</div>
<div class="content">${marked.parse(body)}</div>
</body></html>`;

// 临时 HTML 落在 md 同目录：让「手册截图/xxx.png」相对路径直接解析
const tmpHtml = path.join(path.dirname(path.resolve(mdPath)), '.manual-tmp.html');
fs.writeFileSync(tmpHtml, html);
const outPdf = path.resolve(mdPath.replace(/\.md$/, '.pdf'));
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync(chrome, ['--headless', '--disable-gpu', `--print-to-pdf=${outPdf}`, '--no-pdf-header-footer', '--virtual-time-budget=8000', `file://${tmpHtml}`], { stdio: 'inherit' });
fs.unlinkSync(tmpHtml);
console.log('PDF written:', outPdf);
