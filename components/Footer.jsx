import Link from 'next/link';
import { FOOTER_COLUMNS, FOOTER_META, t } from '../lib/navConfig';
import styles from './Footer.module.css';

/**
 * 全站共享页脚组件。
 *
 * 由来：从首页 pages/index.jsx 的内联豪华页脚（品牌列 + 5 个链接列的 6 列 grid）
 * 移植而来，改为由 lib/navConfig.js 的 FOOTER_COLUMNS / FOOTER_META 数据驱动——
 * 链接对象与顶部导航共享同一个 LINKS 注册表，label/href 永不漂移。
 *
 * 用法：<Footer lang={lang} />
 * - lang 缺省为 'en'（SSR 首帧英文规则：服务端渲染时语言未知，先出英文，
 *   客户端水合后由父页面传入用户语言重渲，与全站 `|| en` 约定一致）。
 * - 纯展示组件，无状态、无副作用，服务端/客户端渲染结果一致（零水合风险）。
 */
export default function Footer({ lang = 'en' }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* 品牌列：logo + 一句话定位 + 九语横幅（结构照首页原版，数据来自 FOOTER_META） */}
        <div className={styles.footerBrandCol}>
          <div className={styles.footerBrand}>
            {/* 装饰性 logo：品牌名紧随其后，故 alt 留空避免读屏重复播报 */}
            <img src="/img/logo-macaw.svg" alt="" width={26} height={26} />
            <b>Talengineer</b>
          </div>
          <p className={styles.footerTagline}>{t(FOOTER_META.tagline, lang)}</p>
          <div className={styles.footerLangs}>{FOOTER_META.langs}</div>
        </div>

        {/* 5 个链接列：完全由 FOOTER_COLUMNS 驱动，列内每个链接是 LINKS 注册表对象 */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.key} className={styles.footerCol}>
            <h2 className={styles.footerColTitle}>{t(col.title, lang)}</h2>
            {col.links.map((l) => (
              <Link key={l.key} href={l.href} className={styles.footerLink}>
                {t(l.label, lang)}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* 底栏版权行 */}
      <div className={styles.footerBottom}>{t(FOOTER_META.copyright, lang)}</div>
    </footer>
  );
}
