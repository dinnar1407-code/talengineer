import { Html, Head, Main, NextScript } from 'next/document';

// 首帧前把主题写到 <html data-theme>，避免深色模式下的白屏闪烁（FOUC）。
// 读取顺序：localStorage('tal-theme') → 系统 prefers-color-scheme → 默认浅色。
// 这段脚本在 React 水合之前同步执行；React 不管理该属性，故不会造成 hydration 不一致。
const THEME_INIT = `(function(){try{var t=localStorage.getItem('tal-theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0056b3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TalEngineer" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
