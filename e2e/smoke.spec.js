// 生产只读冒烟测试：仅 goto + 断言，绝不点击任何写数据/动钱的按钮。
const { test, expect } = require('@playwright/test');

const PUBLIC_PAGES = ['/', '/talent', '/playbook', '/developers', '/rates'];

// 与 pages/console.jsx 的 SCREEN_KEYS 保持一致（该文件里没有 'learning' 这个 screen，
// 认证考试是独立的 /training 页面，这里按实际代码用真实的 7 个 key）。
const CONSOLE_SCREENS = ['dashboard', 'projects', 'escrow', 'messages', 'find', 'profile', 'admin'];

for (const path of PUBLIC_PAGES) {
  test(`public page ${path} loads without error`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    const response = await page.goto(path);
    expect(response.status()).toBeLessThan(400);

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);
  });
}

test.describe('logged-in console + finance smoke', () => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'E2E_EMAIL/E2E_PASSWORD 未配置，跳过登录态冒烟');

  test.beforeEach(async ({ page, request }) => {
    // 直接调登录 API 拿 token（只读操作，不经过任何写表单）
    const res = await request.post('/api/auth/login', {
      data: { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // 与全站一致的 localStorage 结构：{email, name, role, token}（tal_user，见 pages/console.jsx、pages/finance.jsx）
    const user = { email: data.email, name: data.name, role: data.role, token: data.token };
    await page.addInitScript((u) => {
      window.localStorage.setItem('tal_user', JSON.stringify(u));
    }, user);
  });

  for (const screen of CONSOLE_SCREENS) {
    test(`console screen=${screen} loads without error`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto(`/console?screen=${screen}`, { waitUntil: 'networkidle' });

      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);

      expect(pageErrors).toEqual([]);
    });
  }

  test('finance page loads without error', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/finance', { waitUntil: 'networkidle' });

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);
  });
});
