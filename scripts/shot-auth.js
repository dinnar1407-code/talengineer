// 手册登录态截图：playwright-core 驱动本机 Chrome（无需下载浏览器），
// addInitScript 在页面脚本执行前注入 localStorage 登录态（演示账号 token 经 env 传入，不落盘）。
// 用法：TAL_TOKEN=xxx TAL_EMAIL=demo.manual@talengineer.us node scripts/shot-auth.js
const { chromium } = require('playwright-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.join(__dirname, '..', 'docs/manual/手册截图');
const token = process.env.TAL_TOKEN;
const email = process.env.TAL_EMAIL || 'demo.manual@talengineer.us';
if (!token) { console.error('TAL_TOKEN env required'); process.exit(1); }

const SHOTS = [
  { url: 'https://talengineer.us/console', file: '控制台-仪表盘.png', wait: 5000 },
  { url: 'https://talengineer.us/console?screen=projects', file: '控制台-项目.png', wait: 5000 },
  { url: 'https://talengineer.us/console?screen=escrow', file: '控制台-托管.png', wait: 5000 },
  { url: 'https://talengineer.us/finance', file: '托管与支付.png', wait: 5000 },
];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await ctx.addInitScript(([u]) => {
    localStorage.setItem('tal_user', JSON.stringify(u));
    localStorage.setItem('tal_lang', 'zh');       // 手册面向中文读者，截中文界面
    localStorage.setItem('tal-theme', 'light');   // 浅色截图印刷更清晰
  }, [{ email, name: 'Demo Manual', role: 'employer', token }]);
  const page = await ctx.newPage();
  for (const s of SHOTS) {
    try {
      await page.goto(s.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(s.wait);
      await page.screenshot({ path: path.join(OUT, s.file) });
      console.log('OK', s.file);
    } catch (e) { console.error('FAIL', s.file, e.message); }
  }
  await browser.close();
})();
