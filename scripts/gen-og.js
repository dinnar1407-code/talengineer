// 生成社交分享用的 Open Graph 图片 public/og.png（1200×630）。
// 做法：拼一段内联 SVG（深蓝底 + Talengineer 字标 + 口号），用 sharp 光栅化成 PNG。
// 一次性脚本，改了品牌语再手动跑：`node scripts/gen-og.js`。
//
// 字体说明：sharp 通过 librsvg 渲染 SVG 文本，依赖系统字体，故这里用通用的
// sans-serif / monospace 字族，保证任何机器上都能渲染，不依赖未安装的品牌字体。

const path = require('path');
const sharp = require('sharp');

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = path.join(__dirname, '..', 'public', 'og.png');

// 品牌色（与全站深色 token 一致）。
const BG = '#0a1626';
const ACCENT = '#2f74d9';
const INK = '#e6edf6';
const MUTED = '#8ba0bd';

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1626"/>
      <stop offset="100%" stop-color="#101f34"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="10" fill="${ACCENT}"/>
  <circle cx="86" cy="150" r="18" fill="${ACCENT}"/>
  <text x="120" y="164" font-family="sans-serif" font-size="34" font-weight="700" fill="${MUTED}" letter-spacing="2">TALENGINEER</text>
  <text x="80" y="330" font-family="sans-serif" font-size="88" font-weight="800" fill="${INK}">Talengineer</text>
  <text x="82" y="410" font-family="sans-serif" font-size="40" font-weight="600" fill="${ACCENT}">Certified Industrial Automation</text>
  <text x="82" y="466" font-family="sans-serif" font-size="40" font-weight="600" fill="${ACCENT}">Engineers, On Demand</text>
  <text x="82" y="560" font-family="monospace" font-size="26" fill="${MUTED}">PLC · Robotics · Machine Vision · Electrical</text>
</svg>`;

async function main() {
  // BG 已并入 SVG 渐变；此处保留常量供调色时参考。
  void BG;
  await sharp(Buffer.from(svg)).png().toFile(OUT);
  console.log(`[gen-og] wrote ${OUT} (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error('[gen-og] failed:', err);
  process.exit(1);
});
