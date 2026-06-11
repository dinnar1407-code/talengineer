require('dotenv').config();
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // 关闭默认 PII 采集，避免把用户 IP、Cookie/Authorization 头等敏感信息发送给第三方（GDPR 合规）
  sendDefaultPii: false,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
