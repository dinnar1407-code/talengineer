// ── /privacy 页外壳文案字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）────
//
// 来源：pages/privacy.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 页面外壳文案（九语）。正文本身来自 content/legal/privacy.{lang}.md（九语已齐），
// 这里只放 kicker、草稿横幅、交叉链接等 UI 字串。
// 2026-07-24 三期收尾：正文九语铺开后补齐外壳 7 语（es/vi/hi/fr/de/ja/ko），
// 待 Phase-4 QA 复核译文质量。
const DICT = {
  en: {
    kicker: 'Legal',
    draftBanner: 'Draft — pending legal review. This page describes current practice honestly but is not yet the final legal text.',
    updated: 'Last updated',
    crossLabel: 'Also read how the marketplace itself works:',
    crossLink: 'Terms of Service →',
  },
  zh: {
    kicker: '法务',
    draftBanner: '草稿——待法务审核。本页如实描述当前实践，但还不是最终法律文本。',
    updated: '最近更新',
    crossLabel: '也请阅读市场本身的运作规则：',
    crossLink: '服务条款 →',
  },
  es: {
    kicker: 'Legal',
    draftBanner: 'Borrador — pendiente de revisión legal. Esta página describe honestamente la práctica actual, pero aún no es el texto legal definitivo.',
    updated: 'Última actualización',
    crossLabel: 'Lea también cómo funciona el propio marketplace:',
    crossLink: 'Términos del servicio →',
  },
  vi: {
    kicker: 'Pháp lý',
    draftBanner: 'Bản nháp — đang chờ thẩm định pháp lý. Trang này mô tả trung thực thực tiễn hiện tại nhưng chưa phải là văn bản pháp lý cuối cùng.',
    updated: 'Cập nhật lần cuối',
    crossLabel: 'Cũng nên đọc cách chính marketplace vận hành:',
    crossLink: 'Điều khoản dịch vụ →',
  },
  hi: {
    kicker: 'कानूनी',
    draftBanner: 'मसौदा — कानूनी समीक्षा लंबित। यह पृष्ठ वर्तमान प्रथा का ईमानदारी से वर्णन करता है, लेकिन यह अभी अंतिम कानूनी पाठ नहीं है।',
    updated: 'अंतिम अपडेट',
    crossLabel: 'यह भी पढ़ें कि मार्केटप्लेस स्वयं कैसे काम करता है:',
    crossLink: 'सेवा की शर्तें →',
  },
  fr: {
    kicker: 'Juridique',
    draftBanner: "Brouillon — en attente de validation juridique. Cette page décrit honnêtement la pratique actuelle, mais ce n'est pas encore le texte juridique définitif.",
    updated: 'Dernière mise à jour',
    crossLabel: 'Lisez aussi comment fonctionne la marketplace elle-même :',
    crossLink: "Conditions d'utilisation →",
  },
  de: {
    kicker: 'Rechtliches',
    draftBanner: 'Entwurf — juristische Prüfung ausstehend. Diese Seite beschreibt die aktuelle Praxis ehrlich, ist aber noch nicht der endgültige Rechtstext.',
    updated: 'Zuletzt aktualisiert',
    crossLabel: 'Lesen Sie auch, wie der Marktplatz selbst funktioniert:',
    crossLink: 'Nutzungsbedingungen →',
  },
  ja: {
    kicker: '法務',
    draftBanner: '草案 — 法務レビュー待ち。本ページは現在の実務を誠実に記述していますが、最終的な法的文書ではありません。',
    updated: '最終更新',
    crossLabel: 'マーケットプレイス自体の仕組みもご覧ください：',
    crossLink: '利用規約 →',
  },
  ko: {
    kicker: '법률',
    draftBanner: '초안 — 법무 검토 대기 중. 이 페이지는 현재 관행을 있는 그대로 설명하지만 아직 최종 법적 문서가 아닙니다.',
    updated: '최종 업데이트',
    crossLabel: '마켓플레이스 자체가 어떻게 운영되는지도 읽어보세요:',
    crossLink: '서비스 약관 →',
  },
};

module.exports = { DICT };
