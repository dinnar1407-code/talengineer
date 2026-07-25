import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT } from '../lib/i18n/developers';
import styles from './developers.module.css';

// 页面文案（中英双套）已迁至 lib/i18n/developers.js（2026-07-24，架构 B 迁移）。
// 代码块/端点路径/事件名是语言无关的常量，仍内联在 DICT 之外。
// 端点表（路径语言无关，描述双语）。与 src/routes/entV1.js 的实现一一对应。
const ENDPOINTS = [
  { method: 'GET',  path: '/api/v1/ent/demands',                desc: { en: 'List your enterprise demands (paginated: page, limit).', zh: '列出本企业发布的需求（分页参数：page、limit）。', es: 'Liste las demandas de su empresa (paginado: page, limit).', vi: 'Liệt kê các nhu cầu của doanh nghiệp bạn (phân trang: page, limit).', hi: 'अपनी एंटरप्राइज़ डिमांड लिस्ट करें (पेजिनेटेड: page, limit)।', fr: 'Listez les demandes de votre entreprise (pagination : page, limit).', de: 'Listet die Anfragen Ihres Unternehmens auf (paginiert: page, limit).', ja: '自社の需要一覧を取得します(ページネーション:page、limit)。', ko: '귀사의 수요 목록을 조회합니다(페이지네이션: page, limit).' } },
  { method: 'POST', path: '/api/v1/ent/demands',                desc: { en: 'Create a demand. Body: title, description, budget, region.', zh: '创建需求。请求体：title、description、budget、region。', es: 'Cree una demanda. Cuerpo: title, description, budget, region.', vi: 'Tạo một nhu cầu. Body: title, description, budget, region.', hi: 'एक डिमांड बनाएं। Body: title, description, budget, region।', fr: 'Créez une demande. Corps : title, description, budget, region.', de: 'Erstellt eine Anfrage. Body: title, description, budget, region.', ja: '需要を作成します。Body:title、description、budget、region。', ko: '수요를 생성합니다. Body: title, description, budget, region.' } },
  { method: 'GET',  path: '/api/v1/ent/talents',                desc: { en: 'Browse the public engineer directory (no PII). Query: region, skills, page, limit.', zh: '浏览公开工程师目录（无 PII）。查询参数：region、skills、page、limit。', es: 'Explore el directorio público de ingenieros (sin PII). Query: region, skills, page, limit.', vi: 'Duyệt danh bạ kỹ sư công khai (không có PII). Query: region, skills, page, limit.', hi: 'पब्लिक इंजीनियर डायरेक्टरी ब्राउज़ करें (कोई PII नहीं)। Query: region, skills, page, limit।', fr: 'Parcourez l’annuaire public des ingénieurs (sans PII). Query : region, skills, page, limit.', de: 'Durchsuchen Sie das öffentliche Ingenieurverzeichnis (keine PII). Query: region, skills, page, limit.', ja: '公開エンジニアディレクトリを閲覧します(PIIなし)。Query:region、skills、page、limit。', ko: '공개 엔지니어 디렉터리를 조회합니다(PII 없음). Query: region, skills, page, limit.' } },
  { method: 'GET',  path: '/api/v1/ent/demands/:id/milestones', desc: { en: 'List milestones for a demand you own.', zh: '列出本企业某需求的里程碑。', es: 'Liste los hitos de una demanda que le pertenece.', vi: 'Liệt kê các cột mốc của một nhu cầu bạn sở hữu.', hi: 'आपके स्वामित्व वाली डिमांड के माइलस्टोन लिस्ट करें।', fr: 'Listez les jalons d’une demande que vous possédez.', de: 'Listet die Meilensteine einer Ihnen gehörenden Anfrage auf.', ja: '自社が保有する需要のマイルストーンを一覧表示します。', ko: '귀사가 소유한 수요의 마일스톤을 조회합니다.' } },
];

// Webhook 事件（与 payment.js / workorder.js / demand.js 触发点一致）。
const EVENTS = [
  { name: 'milestone.funded',   desc: { en: 'An employer funded a milestone into escrow.', zh: '雇主已将某里程碑款项托管。', es: 'Un empleador depositó un hito en garantía.', vi: 'Một nhà tuyển dụng đã nạp tiền một cột mốc vào ký quỹ.', hi: 'एक नियोक्ता ने माइलस्टोन की राशि एस्क्रो में जमा की।', fr: 'Un employeur a provisionné un jalon sous séquestre.', de: 'Ein Auftraggeber hat einen Meilenstein in die Treuhand eingezahlt.', ja: '雇用者がマイルストーンの資金をエスクローに預けました。', ko: '고용주가 마일스톤 자금을 에스크로에 예치했습니다.' } },
  { name: 'milestone.released', desc: { en: 'Escrowed funds were released to the engineer.', zh: '托管款项已放款给工程师。', es: 'Los fondos en garantía fueron liberados al ingeniero.', vi: 'Tiền ký quỹ đã được giải ngân cho kỹ sư.', hi: 'एस्क्रो में जमा राशि इंजीनियर को रिलीज़ कर दी गई।', fr: 'Les fonds sous séquestre ont été débloqués vers l’ingénieur.', de: 'Die treuhänderisch verwahrten Gelder wurden an den Ingenieur freigegeben.', ja: 'エスクローの資金がエンジニアにリリースされました。', ko: '에스크로 자금이 엔지니어에게 지급되었습니다.' } },
  { name: 'demand.assigned',    desc: { en: 'An engineer was assigned to your demand.', zh: '某工程师已被指派到你的需求。', es: 'Se asignó un ingeniero a su demanda.', vi: 'Một kỹ sư đã được phân công cho nhu cầu của bạn.', hi: 'आपकी डिमांड पर एक इंजीनियर असाइन कर दिया गया।', fr: 'Un ingénieur a été affecté à votre demande.', de: 'Ein Ingenieur wurde Ihrer Anfrage zugewiesen.', ja: 'あなたの需要にエンジニアがアサインされました。', ko: '귀사의 수요에 엔지니어가 배정되었습니다.' } },
];

const PAYLOAD_EXAMPLE = `{
  "event": "milestone.funded",
  "payload": { "milestone_id": 123, "demand_id": 45 },
  "timestamp": "2026-07-17T12:00:00.000Z"
}`;

const VERIFY_EXAMPLE = `const crypto = require('crypto');

// Express: capture the RAW body for this route (e.g. express.raw),
// then verify before trusting the payload.
function verifyTalengineerWebhook(rawBody, headerSignature, webhookSecret) {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)                // the exact bytes we sent
    .digest('hex');

  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(headerSignature || '', 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Usage inside your handler:
//   const sig = req.headers['x-talengineer-signature'];
//   if (!verifyTalengineerWebhook(req.rawBody, sig, process.env.TE_WEBHOOK_SECRET)) {
//     return res.status(401).end();
//   }`;

// MCP 工具清单（与 src/routes/mcp.js 的显式白名单一一对应：public 4 读工具 +
// get_my_projects / get_milestone_status / create_demand_draft，共 7 个）。
const MCP_TOOLS = [
  { name: 'search_engineers',       desc: { en: 'Search the public engineer directory (no PII). Filters: track, region, skill, maxRate, limit.', zh: '搜索公开工程师目录（无 PII）。过滤参数：track、region、skill、maxRate、limit。', es: 'Busque en el directorio público de ingenieros (sin PII). Filtros: track, region, skill, maxRate, limit.', vi: 'Tìm kiếm trong danh bạ kỹ sư công khai (không có PII). Bộ lọc: track, region, skill, maxRate, limit.', hi: 'पब्लिक इंजीनियर डायरेक्टरी सर्च करें (कोई PII नहीं)। फ़िल्टर: track, region, skill, maxRate, limit।', fr: 'Recherchez dans l’annuaire public des ingénieurs (sans PII). Filtres : track, region, skill, maxRate, limit.', de: 'Durchsucht das öffentliche Ingenieurverzeichnis (keine PII). Filter: track, region, skill, maxRate, limit.', ja: '公開エンジニアディレクトリを検索します(PIIなし)。フィルター:track、region、skill、maxRate、limit。', ko: '공개 엔지니어 디렉터리를 검색합니다(PII 없음). 필터: track, region, skill, maxRate, limit.' } },
  { name: 'get_rates',              desc: { en: 'Regional rate benchmarks, optionally filtered by region / specialty.', zh: '区域费率基准，可按 region / specialty 过滤。', es: 'Tarifas de referencia regionales, opcionalmente filtradas por region / specialty.', vi: 'Mức phí tham chiếu theo khu vực, có thể lọc theo region / specialty.', hi: 'क्षेत्रीय दर बेंचमार्क, वैकल्पिक रूप से region / specialty से फ़िल्टर किए गए।', fr: 'Tarifs de référence régionaux, filtrables en option par region / specialty.', de: 'Regionale Vergleichssätze, optional gefiltert nach region / specialty.', ja: '地域別の料金相場。region / specialty で絞り込み可能(任意)。', ko: '지역별 요율 벤치마크. region / specialty로 선택적 필터링이 가능합니다.' } },
  { name: 'get_certification_info', desc: { en: 'The certification system: 4 tracks × levels L1–L3, exam rules and validity.', zh: '平台认证体系：4 方向 × L1–L3 等级、考核规则与有效期。', es: 'El sistema de certificación: 4 especialidades × niveles L1–L3, reglas de examen y vigencia.', vi: 'Hệ thống chứng chỉ: 4 chuyên môn × cấp độ L1–L3, quy tắc thi và thời hạn hiệu lực.', hi: 'प्रमाणन सिस्टम: 4 डायरेक्शन × L1–L3 लेवल, परीक्षा नियम और वैधता।', fr: 'Le système de certification : 4 spécialités × niveaux L1–L3, règles d’examen et validité.', de: 'Das Zertifizierungssystem: 4 Fachrichtungen × Stufen L1–L3, Prüfungsregeln und Gültigkeit.', ja: '認定制度:4方向×レベルL1–L3、試験ルールと有効期限。', ko: '인증 체계: 4개 트랙 × L1–L3 레벨, 시험 규칙 및 유효 기간.' } },
  { name: 'parse_demand',           desc: { en: 'Parse a free-form project need (any language) into a structured demand draft. Nothing is saved.', zh: '把任意语言的大白话需求解析成结构化草稿，不落库。', es: 'Analice una necesidad de proyecto en texto libre (en cualquier idioma) y conviértala en un borrador de demanda estructurado. No se guarda nada.', vi: 'Phân tích một nhu cầu dự án dạng văn bản tự do (bất kỳ ngôn ngữ nào) thành bản nháp nhu cầu có cấu trúc. Không lưu gì cả.', hi: 'किसी भी भाषा में लिखी फ़्री-फ़ॉर्म प्रोजेक्ट ज़रूरत को एक स्ट्रक्चर्ड डिमांड ड्राफ़्ट में पार्स करें। कुछ भी सेव नहीं होता।', fr: 'Analysez un besoin de projet en texte libre (dans n’importe quelle langue) pour le transformer en brouillon de demande structuré. Rien n’est enregistré.', de: 'Wandelt einen frei formulierten Projektbedarf (in beliebiger Sprache) in einen strukturierten Anfrageentwurf um. Es wird nichts gespeichert.', ja: '自由記述のプロジェクトニーズ(どの言語でも可)を構造化された需要の下書きに変換します。何も保存されません。', ko: '자유 형식의 프로젝트 요구 사항(어떤 언어든)을 구조화된 수요 초안으로 변환합니다. 아무것도 저장되지 않습니다.' } },
  { name: 'get_my_projects',        desc: { en: 'List the projects owned by the API key account.', zh: '列出 API key 所属账号的项目。', es: 'Liste los proyectos que pertenecen a la cuenta de la API key.', vi: 'Liệt kê các dự án thuộc sở hữu của tài khoản API key.', hi: 'API key वाले अकाउंट के प्रोजेक्ट लिस्ट करें।', fr: 'Listez les projets appartenant au compte de la clé API.', de: 'Listet die Projekte des zum API-Schlüssel gehörenden Kontos auf.', ja: 'APIキーが属するアカウントのプロジェクトを一覧表示します。', ko: 'API 키가 속한 계정의 프로젝트를 조회합니다.' } },
  { name: 'get_milestone_status',   desc: { en: 'Milestone / escrow status for a project you participate in.', zh: '查询你参与项目的里程碑 / 托管状态。', es: 'Estado de hito / depósito en garantía de un proyecto en el que usted participa.', vi: 'Trạng thái cột mốc / ký quỹ của một dự án bạn tham gia.', hi: 'आपके किसी प्रोजेक्ट का माइलस्टोन / एस्क्रो स्टेटस।', fr: 'Statut du jalon / séquestre pour un projet auquel vous participez.', de: 'Meilenstein-/Treuhandstatus für ein Projekt, an dem Sie beteiligt sind.', ja: 'あなたが参加しているプロジェクトのマイルストーン/エスクロー状況。', ko: '참여 중인 프로젝트의 마일스톤/에스크로 상태.' } },
  { name: 'create_demand_draft',    desc: { en: 'Save a demand as a private draft (status = draft) — never auto-published.', zh: '把需求存为私有草稿（status = draft）——绝不自动发布。', es: 'Guarde una demanda como borrador privado (status = draft) — nunca se publica automáticamente.', vi: 'Lưu một nhu cầu dưới dạng bản nháp riêng tư (status = draft) — không bao giờ tự động đăng.', hi: 'डिमांड को प्राइवेट ड्राफ़्ट के रूप में सेव करें (status = draft) — कभी अपने आप पब्लिश नहीं होता।', fr: 'Enregistrez une demande comme brouillon privé (status = draft) — jamais publié automatiquement.', de: 'Speichert eine Anfrage als privaten Entwurf (status = draft) — wird nie automatisch veröffentlicht.', ja: '需要をプライベートな下書き(status = draft)として保存します——自動的に公開されることはありません。', ko: '수요를 비공개 초안(status = draft)으로 저장합니다 — 자동으로 게시되지 않습니다.' } },
];

// JSON-RPC 2.0 调用示例（curl；语言无关，放 DICT 之外）。
const MCP_EXAMPLE = `curl -X POST https://talengineer.us/api/mcp \\
  -H "Authorization: Bearer TE_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_engineers",
      "arguments": { "region": "Monterrey", "skill": "Siemens S7", "limit": 3 }
    }
  }'`;

export default function Developers() {
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en;
  const L = DICT[lang] ? lang : 'en'; // 端点/事件描述的语言键（仅 en/zh，其余回退 en）

  return (
    <>
      <Head>
        <title>Developer API Docs | Talengineer</title>
        <meta name="description" content="Talengineer API v1 for developers — authentication, endpoints, signed webhooks, and an MCP endpoint AI agents can call directly." />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Authentication */}
        <section className={styles.section}>
          <h2>{d.authTitle}</h2>
          <p className={styles.sectionDesc}>{d.authDesc}</p>
          <p className={styles.sectionDesc}>{d.baseUrlLabel}: <code className={styles.code}>https://talengineer.us/api/v1/ent</code></p>
          <p className={styles.sectionDesc}>{d.authHeaderLabel}: <code className={styles.code}>Authorization: Bearer TE_your_key_here</code></p>
        </section>

        {/* Endpoints */}
        <section className={styles.section}>
          <h2>{d.endpointsTitle}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>{d.colMethod}</th><th>{d.colPath}</th><th>{d.colDesc}</th></tr>
              </thead>
              <tbody>
                {ENDPOINTS.map(e => (
                  <tr key={e.method + e.path}>
                    <td><span className={`${styles.method} ${styles['m' + e.method]}`}>{e.method}</span></td>
                    <td><code className={styles.code}>{e.path}</code></td>
                    <td>{e.desc[L]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Webhooks */}
        <section className={styles.section}>
          <h2>{d.webhooksTitle}</h2>
          <p className={styles.sectionDesc}>{d.webhooksDesc}</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>{d.colEvent}</th><th>{d.colDesc}</th></tr>
              </thead>
              <tbody>
                {EVENTS.map(ev => (
                  <tr key={ev.name}>
                    <td><code className={styles.code}>{ev.name}</code></td>
                    <td>{ev.desc[L]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.subTitle}>{d.payloadTitle}</h3>
          <p className={styles.sectionDesc}>{d.payloadDesc}</p>
          <pre className={styles.codeBlock}>{PAYLOAD_EXAMPLE}</pre>

          <h3 className={styles.subTitle}>{d.sigTitle}</h3>
          <p className={styles.sectionDesc}>{d.sigDesc}</p>
          <pre className={styles.codeBlock}>{VERIFY_EXAMPLE}</pre>

          <Link href="/enterprise" className={styles.manageBtn}>{d.manageBtn}</Link>
        </section>

        {/* MCP — AI Agent 直连（差异化卖点 + 端点/鉴权/工具清单/示例） */}
        <section className={styles.section}>
          <h2>{d.mcpTitle}</h2>
          <p className={styles.sectionDesc}><b>{d.mcpSell}</b></p>
          <p className={styles.sectionDesc}>{d.mcpDesc}</p>
          <p className={styles.sectionDesc}>{d.baseUrlLabel}: <code className={styles.code}>https://talengineer.us/api/mcp</code></p>
          <p className={styles.sectionDesc}>{d.authHeaderLabel}: <code className={styles.code}>Authorization: Bearer TE_your_key_here</code></p>
          <p className={styles.sectionDesc}>{d.mcpAuthDesc}</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>{d.colTool}</th><th>{d.colDesc}</th></tr>
              </thead>
              <tbody>
                {MCP_TOOLS.map(tool => (
                  <tr key={tool.name}>
                    <td><code className={styles.code}>{tool.name}</code></td>
                    <td>{tool.desc[L]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.sectionDesc} style={{ marginTop: 12 }}>{d.mcpSafety}</p>

          <h3 className={styles.subTitle}>{d.mcpExampleTitle}</h3>
          <pre className={styles.codeBlock}>{MCP_EXAMPLE}</pre>
        </section>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </>
  );
}
