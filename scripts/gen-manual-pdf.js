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

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${meta.title || 'Manual'}</title><style>
  @page { margin: 18mm 16mm; }
  body { font-family: "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; color:#1f2937; line-height:1.8; font-size:11pt; }
  .cover { text-align:center; padding:120px 0 40px; page-break-after: always; }
  .cover h1 { border:none; font-size:28pt; }
  .cover .tagline { color:#6b7280; font-size:12pt; margin-top:8px; }
  .cover .meta { margin-top:60px; color:#9ca3af; font-size:10pt; }
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
</style></head><body>
<div class="cover">
  <div style="font-size:40pt">🦜</div>
  <h1>${meta.title || ''}</h1>
  <div class="tagline">Certified Industrial Automation Engineers, On Demand</div>
  <div class="meta">${meta.version || ''} · ${meta.date || ''}<br/>${meta.site || ''}</div>
</div>
${marked.parse(body)}
</body></html>`;

const tmpHtml = path.join(os.tmpdir(), 'tal-manual.html');
fs.writeFileSync(tmpHtml, html);
const outPdf = path.resolve(mdPath.replace(/\.md$/, '.pdf'));
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync(chrome, ['--headless', '--disable-gpu', `--print-to-pdf=${outPdf}`, '--no-pdf-header-footer', '--virtual-time-budget=4000', `file://${tmpHtml}`], { stdio: 'inherit' });
console.log('PDF written:', outPdf);
