import Head from 'next/head';

// 离线降级页：Service Worker 在断网且无缓存命中时，把导航请求回退到这里。
// 纯静态、无数据依赖，主题跟随全站 token（globals.css）。
export default function Offline() {
  return (
    <>
      <Head>
        <title>离线 · TalEngineer</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <img
          src="/img/logo-macaw.svg"
          alt="TalEngineer"
          width={72}
          height={72}
          style={{ marginBottom: '1.5rem' }}
        />
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', margin: '0 0 0.75rem' }}>
          You&apos;re offline / 当前离线
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.6, margin: '0 0 1.75rem' }}>
          Network connection lost. Please check your connection and try again.
          <br />
          网络连接已断开，请检查网络后重试。
        </p>
        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
          style={{
            padding: '0.7rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--primary-ink)',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Retry / 重试
        </button>
      </main>
    </>
  );
}
