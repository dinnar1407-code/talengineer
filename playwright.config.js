// 生产只读冒烟配置：单浏览器、串行、失败留 trace
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 45000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://talengineer.us',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
});
